package codenames

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"time"
)

const wordsPerGame = 25

// Team is used to set the team of each word
type Team int

const (
	// Neutral is a Team type
	Neutral Team = iota
	// Red is a Team type
	Red
	// Blue is a Team type
	Blue
	// Black is a Team type
	Black
)

// String returns the string value (lowercase) of the team
func (t Team) String() string {
	switch t {
	case Red:
		return "red"
	case Blue:
		return "blue"
	case Black:
		return "black"
	default:
		return "neutral"
	}
}

// Other swaps red and blue teams but returns black and neutral without edit
func (t Team) Other() Team {
	if t == Red {
		return Blue
	}
	if t == Blue {
		return Red
	}
	return t
}

// Repeat creates a slice of n Teams of team t
func (t Team) Repeat(n int) []Team {
	s := make([]Team, n)
	for i := 0; i < n; i++ {
		s[i] = t
	}
	return s
}

// UnmarshalJSON takes a JSON and turns it into a team object
func (t *Team) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}

	switch s {
	case "red":
		*t = Red
	case "blue":
		*t = Blue
	case "black":
		*t = Black
	default:
		*t = Neutral
	}
	return nil
}

// MarshalJSON takes a team object and turns it into a JSON object
func (t Team) MarshalJSON() ([]byte, error) {
	return json.Marshal(t.String())
}

// GameMode represents if this is a regular or duet game
type GameMode int

const (
	// Regular is a regular codenames game
	Regular GameMode = iota
	// Duet is a duet codenames game
	Duet
)

// String returns the string value (lowercase) of the gameMode
func (g GameMode) String() string {
	switch g {
	case Regular:
		return "regular"
	default:
		return "duet"
	}
}

// UnmarshalJSON takes a JSON and turns it into a gameMode object
func (g *GameMode) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	switch s {
	case "regular":
		*g = Regular
	case "duet":
		*g = Duet
	}
	return nil
}

// MarshalJSON takes a gameMode object and turns it into a JSON object
func (g GameMode) MarshalJSON() ([]byte, error) {
	return json.Marshal(g.String())
}

// GameState encapsulates enough data to reconstruct
// a Game's state. It's used to recreate games after
// a process restart.
type GameState struct {
	Seed      int64    `json:"seed"`
	PermIndex int      `json:"permIndex"`
	Round     int      `json:"round"`
	Revealed  []bool   `json:"revealed"`
	WordSet   []string `json:"wordSet"`
}

func (gs GameState) anyRevealed() bool {
	var revealed bool
	for _, r := range gs.Revealed {
		revealed = revealed || r
	}
	return revealed
}

// Game stores a game in the db (in progress or completed)
type Game struct {
	GameState
	ID             string    `json:"gameID"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	WinningTeam    *Team     `json:"winningTeam,omitempty"`
	Words          []string  `json:"words"`
	Layout         []Team    `json:"layout"`
	Revealed       []bool    `json:"revealed"`
	RoundStartedAt time.Time `json:"round_started_at,omitempty"`
	Mode           GameMode  `json:"mode"`
	Turn           Team      `json:"turn"`
	Round          int       `json:"round"`
}

func newGame(id string, state GameState, mode GameMode) *Game {
	// consistent randomness across games with the same seed
	seedRnd := rand.New(rand.NewSource(state.Seed))
	// distinct randomness across games with same seed
	randRnd := rand.New(rand.NewSource(state.Seed * int64(state.PermIndex+1)))

	game := &Game{
		ID:             id,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		Turn:           Team(randRnd.Intn(2)) + Red,
		Words:          make([]string, 0, wordsPerGame),
		Layout:         make([]Team, 0, wordsPerGame),
		Revealed:       make([]bool, 0, wordsPerGame),
		GameState:      state,
		RoundStartedAt: time.Now(),
		Mode:           mode,
		Round:          0,
	}

	// Pick the next `wordsPerGame` words from the
	// randomly generated permutation
	perm := seedRnd.Perm(len(state.WordSet))
	permIndex := state.PermIndex
	for _, i := range perm[permIndex : permIndex+wordsPerGame] {
		w := state.WordSet[perm[i]]
		game.Words = append(game.Words, w)
	}

	// Pick a random permutation of team assignments.
	var teamAssignments []Team
	teamAssignments = append(teamAssignments, Red.Repeat(8)...)
	teamAssignments = append(teamAssignments, Blue.Repeat(8)...)
	teamAssignments = append(teamAssignments, Neutral.Repeat(7)...)
	teamAssignments = append(teamAssignments, Black)
	teamAssignments = append(teamAssignments, game.Turn)

	randRnd.Shuffle(len(teamAssignments), func(i, j int) {
		teamAssignments[i], teamAssignments[j] = teamAssignments[j], teamAssignments[i]
	})

	game.Layout = teamAssignments

	// definitely not the correct way to do this
	for i := 0; i < wordsPerGame; i++ {
		game.Revealed = append(game.Revealed, false)
	}

	return game
}

// StateID updates the stateID to the current time
func (g *Game) StateID() string {
	return fmt.Sprintf("%019d", g.UpdatedAt.UnixNano())
}

func (g *Game) checkWinningCondition() {
	if g.WinningTeam != nil {
		return
	}
	var redRemaining, blueRemaining bool
	for i, t := range g.Layout {
		if g.Revealed[i] {
			continue
		}
		switch t {
		case Red:
			redRemaining = true
		case Blue:
			blueRemaining = true
		}
	}
	if !redRemaining {
		winners := Red
		g.WinningTeam = &winners
	}
	if blueRemaining {
		winners := Blue
		g.WinningTeam = &winners
	}
}

// Guess is a function to facilitate the guess of a single word, at the specified index
// returns nil if index is valid ([0, 24]) and not already guessed
func (g *Game) Guess(index int, team Team) error {
	fmt.Println("Game.Guess:", index, wordsPerGame, team)
	if team != g.Turn {
		fmt.Println(g.Turn, team)
		return errors.New("It's not your turn")
	}
	if index > wordsPerGame-1 || index < 0 {
		return fmt.Errorf("Index %d is invalid", index)
	}
	if len(g.Revealed) < index {
		return errors.New("Revealed has wrong length")
	}
	if g.Revealed[index] {
		return errors.New("Cell has already been revealed")
	}

	fmt.Printf("Guessing word %d in game %s\n", index, g.ID)

	g.UpdatedAt = time.Now()
	g.Revealed[index] = true

	if g.Layout[index] == Black {
		// Game Over
		winners := g.Turn.Other()
		g.WinningTeam = &winners
		return nil
	}

	g.checkWinningCondition()
	if g.Layout[index] != g.Turn {
		g.nextTurn()
	}
	return nil
}

func (g *Game) nextTurn() {
	g.Round++
	g.Turn = g.Turn.Other()
}

// NextTurn advances the game to the next turn
func (g *Game) NextTurn(currentTurn int, team Team) bool {
	if g.WinningTeam != nil {
		return false
	}

	if team != g.Turn {
		return false
	}
	// TODO: remove currentTurn != 0 once we can be sure all
	// clients are running up-to-date versions of the frontend.
	if g.Round != currentTurn {
		return false
	}
	// g.UpdatedAt = time.Now()
	g.Round++
	g.Turn = g.Turn.Other()
	// g.RoundStartedAt = time.Now()
	return true
}
