package codenames

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

var closed chan struct{}

func init() {
	closed = make(chan struct{})
	close(closed)
}

// Store interface to save games to
type Store interface {
	Save(*Game) error
}

// GameHandle provides access to the games in the store? I think?
type GameHandle struct {
	store Store

	mu          sync.Mutex
	updated     chan struct{} // closed when the game is updated
	replaced    chan struct{} // closed when the game has been replaced
	marshaled   []byte
	g           *Game
	connections []*websocket.Conn // used to emit game changes over the socket
}

// get a new handle for a game g
func newHandle(g *Game, s Store) *GameHandle {
	fmt.Println("Creating new handle for game", g.ID)
	gh := &GameHandle{
		store:    s,
		g:        g,
		updated:  make(chan struct{}),
		replaced: make(chan struct{}),
	}
	err := s.Save(g)
	if err != nil {
		log.Printf("Unable to write updated game %q to disk: %s\n", gh.g.ID, err)
	}
	return gh
}

// update the game object and write it to the disk
func (gh *GameHandle) update(fn func(*Game) bool) {
	gh.mu.Lock()
	defer gh.mu.Unlock()
	fmt.Println("Calling fn")
	ok := fn(gh.g)
	if !ok {
		// game wasn't updated
		fmt.Println("Game not updated")
		return
	}

	// game was updated - notify everyone
	// fmt.Println("Acquiring lock (GameHandle.update)")
	// s.mu.Lock()
	// fmt.Println("Lock Acquired (GameHandle.update)")
	fmt.Println("Game was updated - notifying")
	go func(gh *GameHandle) {
		for _, conn := range gh.connections {
			socketWriteGame(conn, gh)
		}
	}(gh)
	// s.mu.Unlock()
	// fmt.Println("Releasing lock")
	fmt.Println("Done sending game to subscribers")

	gh.marshaled = nil
	ch := gh.updated
	gh.updated = make(chan struct{})

	// write the updated game to disk
	err := gh.store.Save(gh.g)
	if err != nil {
		log.Printf("Unable to write updated game %q to disk: %s", gh.g.ID, err)
	}

	close(ch)
}

// truely no clue what this does
func (gh *GameHandle) gameStateChanged(stateID *string) (updated <-chan struct{}, replaced <-chan struct{}) {
	if stateID == nil {
		return closed, nil
	}

	gh.mu.Lock()
	defer gh.mu.Unlock()
	if gh.g.StateID() != *stateID {
		return closed, nil
	}
	return gh.updated, gh.replaced
}

// MarshalJSON implements the encoding/json.Marshaler interface.
// It caches a marshalled value of the game object.
func (gh *GameHandle) MarshalJSON() ([]byte, error) {
	gh.mu.Lock()
	defer gh.mu.Unlock()

	var err error
	if gh.marshaled == nil {
		gh.marshaled, err = json.Marshal(struct {
			*Game
			StateID string `json:"state_id"`
		}{gh.g, gh.g.StateID()})
	}
	return gh.marshaled, err
}

// Server object
type Server struct {
	// Server http.Server
	Store Store

	// tpl         *template.Template
	// gameIDWords []string

	mu           sync.Mutex
	games        map[string]*GameHandle
	defaultWords []string
	// mux          *http.ServeMux

	// statOpenRequests  int64 // atomic access
	// statTotalRequests int64 //atomic access
}

// Start the server
func (s *Server) Start(games map[string]*Game) error {

	s.games = make(map[string]*GameHandle)
	if games != nil {
		for _, g := range games {
			s.games[g.ID] = newHandle(g, s.Store)
		}
	}

	// this is the socket used to do all game events
	http.HandleFunc("/game", s.initializeSocket)

	handler := cors.AllowAll().Handler(http.DefaultServeMux)
	return http.ListenAndServe("localhost:9090", handler)
}

// start a game and whatnot
func (s *Server) initializeSocket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Recieved Request: /game")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Print("upgrade:", err)
		return
	}

	// listen for new messages
	go s.messageHandler(conn)
}

func (s *Server) messageHandler(conn *websocket.Conn) {

	for {
		var message struct {
			Type    string    `json:"type"`
			GameID  string    `json:"gameID"`
			Index   *int      `json:"index,omitempty"`
			Round   *int      `json:"round,omitempty"`
			Team    *Team     `json:"team,omitempty"`
			Mode    *GameMode `json:"mode,omitempty"`
			WordSet *[]string `json:"wordSet,omitempty"`
		}

		err := conn.ReadJSON(&message)

		if err != nil {
			fmt.Println("Error Reading Message:", err)
			break
		}
		fmt.Println("Recieved Message:", message)

		if message.Type == "new" {
			s.handleNewGame(conn, message.GameID, message.Mode, message.WordSet)
		} else if message.Type == "find" {
			s.handleFindGame(conn, message.GameID)
		} else if message.Type == "start" {
			s.handleStart(conn, message.GameID)
		} else if message.Type == "guess" {
			s.handleGuess(conn, message.GameID, message.Index, message.Team)
		} else if message.Type == "end turn" {
			s.handleEndTurn(conn, message.GameID, message.Round, message.Team)
		}
	}
}

// this will create a new game. If there is already a game, it will fail
func (s *Server) handleNewGame(conn *websocket.Conn, gameID string, modeP *GameMode, wordSetP *[]string) {

	fmt.Println("Recieved Request: /new-game", gameID)

	// first, check that the pointers are valid
	if modeP == nil || wordSetP == nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: Invalid call to new game. Please try again."))
		return
	}
	// this is where that weird function is
	mode := *modeP
	wordSet := *wordSetP

	words := s.defaultWords
	if len(wordSet) > 0 {
		if len(wordSet) >= 25 {
			words = wordSet
		} else {
			words = append(words, wordSet...)
		}
		sort.Strings(words) // why is this here?
	}

	// lock because we don't want a race condition on checking if the game exists
	fmt.Println("Aquiring lock (Server.socketNewGame)")
	s.mu.Lock() // only one concurrent writer
	fmt.Println("Lock Aquired (Server.socketNewGame)")
	defer s.mu.Unlock()
	defer fmt.Println("Releasing lock (Server.socketNewGame)")

	gh, ok := s.games[gameID]

	if !ok {
		// no game exists, create one
		fmt.Println("Creating game, returning success")
		gh = newHandle(newGame(gameID, randomState(words), mode), s.Store)
		s.games[gameID] = gh

		conn.WriteMessage(websocket.TextMessage, []byte("success"))
	} else {
		fmt.Println("Game already exists!")
		conn.WriteMessage(websocket.TextMessage,
			[]byte("Game already exists - please use a different code or join the game"))
	}
}

func (s *Server) handleFindGame(conn *websocket.Conn, gameID string) {
	// lock because we don't want a race condition on checking if the game exists
	s.mu.Lock()
	defer s.mu.Unlock()

	_, ok := s.games[gameID]

	if ok {
		conn.WriteMessage(websocket.TextMessage, []byte("success"))
	} else {
		conn.WriteMessage(websocket.TextMessage, []byte("Game does not exist!"))
	}
}

func (s *Server) handleStart(conn *websocket.Conn, gameID string) {
	gh, ok := s.games[gameID]
	if !ok {
		conn.WriteMessage(websocket.TextMessage, []byte("Game does not exist!"))
		conn.Close()
		return
	}
	socketWriteGame(conn, gh)
	// put this connection in the gamehandle so it will listen for new stuff
	fmt.Println("Locking GH")
	gh.mu.Lock()
	gh.connections = append(gh.connections, conn)
	gh.mu.Unlock()
	fmt.Println("Unlocking GH")
}

func (s *Server) handleGuess(conn *websocket.Conn, gameID string, indexP *int, teamP *Team) {
	gh, ok := s.games[gameID]
	if !ok {
		conn.WriteMessage(websocket.TextMessage, []byte("Game does not exist!"))
		conn.Close()
		return
	}

	if indexP == nil || teamP == nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Invalid guess! Please try again."))
		return
	}
	index := *indexP
	team := *teamP

	var err error
	gh.update(func(g *Game) bool {
		err = g.Guess(index, team)
		if err != nil {
			fmt.Printf(err.Error())
		}
		return err == nil
	})

	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
	}
}

func (s *Server) handleEndTurn(conn *websocket.Conn, gameID string, roundP *int, teamP *Team) {
	gh, ok := s.games[gameID]
	if !ok {
		conn.WriteMessage(websocket.TextMessage, []byte("Game does not exist!"))
		conn.Close()
		return
	}

	if roundP == nil || teamP == nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Invalid guess! Please try again."))
		return
	}
	round := *roundP
	team := *teamP

	gh.update(func(g *Game) bool {
		return g.NextTurn(round, team)
	})
}

func socketWriteGame(conn *websocket.Conn, gh *GameHandle) {
	fmt.Printf("Writing game %s to connection %s\n", gh.g.ID, conn.RemoteAddr())
	err := conn.WriteJSON(gh)
	if err != nil {
		fmt.Println("Error:", err)
	}
}

// Create a Random Game State
func randomState(words []string) GameState {
	return GameState{
		Seed:      rand.Int63(),
		PermIndex: 0,
		Round:     0,
		Revealed:  make([]bool, wordsPerGame),
		WordSet:   words,
	}
}

// nextGameState returns a new GameState for the next game.
func nextGameState(state GameState) GameState {
	state.PermIndex = state.PermIndex + wordsPerGame
	if state.PermIndex+wordsPerGame >= len(state.WordSet) {
		state.Seed = rand.Int63()
		state.PermIndex = 0
	}
	state.Revealed = make([]bool, wordsPerGame)
	state.Round = 0
	return state
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(*http.Request) bool { return true }, // TODO: change to some type of origin checking
}
