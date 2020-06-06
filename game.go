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
// type Team string

const (
	// Neutral is a Team type
	Neutral string = "neutral"
	// Red is a Team type
	Red string = "red"
	// Blue is a Team type
	Blue string = "blue"
	// Black is a Team type - death word
	Black string = "black"
	// Green is a Team type for Duet
	Green string = "green"
	// Hidden is a Team type, for the revealed board
	Hidden string = "hidden"
)

func otherTeam(s string) string {
	if s == "red" {
		return "blue"
	}
	if s == "blue" {
		return "red"
	}
	return s
}

func randTeam(randRnd *rand.Rand) string {
	if randRnd.Intn(2) == 0 {
		return "red"
	} else {
		return "blue"
	}
}

/*
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
	case "green":
		*t = Green
	case "hidden":
		*t = Hidden
	default:
		*t = Neutral
	}
	return nil
}

// MarshalJSON takes a team object and turns it into a JSON object
func (t Team) MarshalJSON() ([]byte, error) {
	// return json.Marshal(string(t)) // doesn't work....
	var s string
	switch t {
	case Red:
		s = "red"
	case Blue:
		s = "blue"
	case Black:
		s = "black"
	case Green:
		s = "green"
	case Hidden:
		s = "hidden"
	default:
		s = "neutral"
	}
	return json.Marshal(s)
}
*/

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
	WordSet   []string `json:"wordSet"`
}

// func (gs GameState) anyRevealed() bool {
// 	var revealed bool
// 	for _, r := range gs.Revealed {
// 		revealed = revealed || r
// 	}
// 	return revealed
// }

// Game stores a game in the db (in progress or completed)
type Game struct {
	state          GameState                       // unexported, so not in json
	ID             string                          `json:"gameID"`
	CreatedAt      time.Time                       `json:"created_at,omitempty"`
	UpdatedAt      time.Time                       `json:"updated_at,omitempty"`
	WinningTeam    *string                         `json:"winningTeam,omitempty"`
	Words          []string                        `json:"words"`
	RoundStartedAt time.Time                       `json:"round_started_at,omitempty"`
	Mode           GameMode                        `json:"mode"`
	Turn           string                          `json:"turn"`
	Layout         map[string][wordsPerGame]string `json:"layout,omitempty"`
	Revealed       [wordsPerGame]string            `json:"revealed"`
	Round          int                             `json:"round"`
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
		Turn:           randTeam(randRnd),
		Words:          make([]string, 0, wordsPerGame),
		state:          state,
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
	if mode == Regular {
		game.Layout = regularLayout(randRnd, game.Turn)
	} else if mode == Duet {
		game.Layout = duetLayout(randRnd)
	}

	for i := 0; i < wordsPerGame; i++ {
		game.Revealed[i] = Hidden
	}

	return game
}

func regularLayout(randRnd *rand.Rand, startTeam string) map[string][wordsPerGame]string {
	t := [wordsPerGame]string{
		Red, Red, Red, Red, Red, Red, Red, Red,
		Blue, Blue, Blue, Blue, Blue, Blue, Blue, Blue,
		Neutral, Neutral, Neutral, Neutral, Neutral, Neutral, Neutral,
		Black,
	}

	t[wordsPerGame-1] = startTeam

	if len(t) != wordsPerGame {
		fmt.Println("ERROR: words length not equal to wordsPerGame (25)", len(t))
		panic("ERROR: words length not equal to wordsPerGame (25)")
	}

	randRnd.Shuffle(len(t), func(i, j int) {
		t[i], t[j] = t[j], t[i]
	})

	var words [wordsPerGame][2]string
	for i, v := range t {
		words[i][0] = v
	}
	return map[string][wordsPerGame]string{Blue: t, Red: t}
}

func duetLayout(randRnd *rand.Rand) map[string][wordsPerGame]string {

	red := [wordsPerGame]string{
		Green, Green, Green,
		Green, Green, Green, Green, Green,
		Neutral, Neutral, Neutral, Neutral, Neutral,
		Neutral, Neutral, Neutral, Neutral, Neutral, Neutral, Neutral,
		Black, Black, Black, Neutral, Green,
	}
	blue := [wordsPerGame]string{
		Green, Green, Green,
		Neutral, Neutral, Neutral, Neutral, Neutral,
		Green, Green, Green, Green, Green,
		Neutral, Neutral, Neutral, Neutral, Neutral, Neutral, Neutral,
		Green, Neutral, Black, Black, Black,
	}

	if len(red) != wordsPerGame || len(blue) != wordsPerGame {
		fmt.Println("ERROR: words length not equal to wordsPerGame (25)", len(red))
		panic("ERROR: words length not equal to wordsPerGame (25)")
	}

	// shuffle the words
	randRnd.Shuffle(len(red), func(i, j int) {
		red[i], red[j] = red[j], red[i]
		blue[i], blue[j] = blue[j], blue[i]
	})

	return map[string][wordsPerGame]string{Blue: blue, Red: red}
}

// StateID updates the stateID to the current time
func (g *Game) StateID() string {
	return fmt.Sprintf("%019d", g.UpdatedAt.UnixNano())
}

// only valid for regular games
func (g *Game) checkWinningCondition() {
	if g.WinningTeam != nil {
		return
	}

	var redRemaining, blueRemaining bool

	if g.Mode == Regular {
		for i, t := range g.Revealed {
			if t != Hidden {
				continue
			}
			if g.Layout[Red][i] == Red {
				redRemaining = true
			} else if g.Layout[Blue][i] == Blue {
				blueRemaining = true
			}
		}
		if !redRemaining {
			winners := Red
			g.WinningTeam = &winners
		}
		if !blueRemaining {
			winners := Blue
			g.WinningTeam = &winners
		}
	} else {
		for i, t := range g.Revealed {
			if !(t == Hidden ||
				(g.Layout[Red][i] == Neutral && g.Layout[Blue][i] == Neutral)) {
				continue
			}
			if g.Layout[Red][i] == Green {
				redRemaining = true
			} else if g.Layout[Blue][i] == Green {
				blueRemaining = true
			}
		}
		if !redRemaining && !blueRemaining {
			winners := Green
			g.WinningTeam = &winners
		}
	}

}

// Guess is a function to facilitate the guess of a single word, at the specified index
// returns nil if index is valid ([0, 24]) and not already guessed
func (g *Game) Guess(index int, team string) error {
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
	if g.WinningTeam != nil {
		return fmt.Errorf("The game is over! The %s team won\n",
			g.WinningTeam)
	}

	fmt.Printf("Guessing word %d in game %s\n", index, g.ID)

	g.UpdatedAt = time.Now()

	if g.Revealed[index] != Hidden {
		return errors.New("Cell has already been revealed")
	}

	if g.Mode == Duet {
		if g.Layout[team][index] != Neutral {
			g.Revealed[index] = g.Layout[team][index]
		} else {
			fmt.Println("Guess Neutral")
			g.Revealed[index] = team
		}
		if g.Layout[team][index] != Green {
			g.nextTurn()
		}
	} else {
		// Regular
		g.Revealed[index] = g.Layout[team][index]
		g.checkWinningCondition()
		if g.Layout[team][index] != g.Turn {
			g.nextTurn()
		}
	}

	if g.Layout[team][index] == Black {
		// Game Over
		winners := otherTeam(g.Turn)
		g.WinningTeam = &winners
	}

	return nil
}

func (g *Game) nextTurn() {
	g.Round++
	g.Turn = otherTeam(g.Turn)
}

// NextTurn advances the game to the next turn
func (g *Game) NextTurn(currentTurn int, team string) bool {
	if g.WinningTeam != nil {
		fmt.Println("game is already over")
		return false
	}

	if team != g.Turn {
		fmt.Println("wrong team tried to end turn")
		return false
	}
	// TODO: remove currentTurn != 0 once we can be sure all
	// clients are running up-to-date versions of the frontend.
	if g.Round != currentTurn {
		return false
	}
	// g.UpdatedAt = time.Now()
	g.Round++
	g.Turn = otherTeam(g.Turn)
	// g.RoundStartedAt = time.Now()
	return true
}
