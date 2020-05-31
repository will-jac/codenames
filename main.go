package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
)

type createGameState struct {
	gameMode string
	joinCode string
}

type word struct {
	value string
	color string
}

func readWordsFromFile() []word {
	data, err := ioutil.ReadFile("./words.json")
	if err != nil {
		fmt.Println("File reading error", err)
	}

	type wordFile struct {
		language map[string][]word
	}

	var wordsInFile wordFile

	err = json.Unmarshal(data, &wordsInFile)
	if err != nil {
		fmt.Println("JSONerror:", err)
	}

	return wordsInFile.language["English (Original)"]
}

func buildWordGrid(wordList []word) func([25]word) {

	rand.Shuffle(len(wordList), func(i, j int) {
		wordList[i], wordList[j] = wordList[j], wordList[i]
	})

	i := 0

	return func(wordGrid [25]word) {
		if i < len(wordList)+25 {
			for j := 0; j < 25; j++ {
				wordGrid[j] = wordList[i]
				i++
			}
		} else {
			rand.Shuffle(len(wordList), func(i, j int) {
				wordList[i], wordList[j] = wordList[j], wordList[i]
			})
			i = 0
		}
	}

}

func createGame(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var t createGameState
	err := decoder.Decode(&t)
	if err != nil {
		panic(err)
	}

	log.Println(t.gameMode)
	log.Println(t.joinCode)

	// do the code to create a game //
	var wordGrid [25]word
	wordList := readWordsFromFile()
	wordGridBuilder := buildWordGrid(wordList)
	wordGridBuilder(wordGrid)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(wordGrid)
}

func sayHello(w http.ResponseWriter, r *http.Request) {
	message := r.URL.Path
	message = strings.TrimPrefix(message, "/")
	message = "Hello " + message

	w.Write([]byte(message))
}

func ping(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("pong"))
}

func main() {
	http.HandleFunc("/create-game", createGame)
	http.HandleFunc("/ping", ping)
	if err := http.ListenAndServe(":9090", nil); err != nil {
		panic(err)
	}
}
