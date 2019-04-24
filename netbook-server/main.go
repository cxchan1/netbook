package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/mux"
)

type NetWorth struct {
	TotalAssets      float64 `json:"totalAssets"`
	TotalLiabilities float64 `json:"totalLiabilities"`
	TotalNetWorth    float64 `json:"totalNetWorth"`
}

type AssetAndLiability struct {
	Amount float64 `json:"amount"`
	Rate   float64 `json:"interestRate"`
}

type CurrencyRate struct {
	Base            string             `json:"base"`
	Date            string             `json:"date"`
	TimeLastUpdated int                `json:"time_last_updated"`
	Rates           map[string]float64 `json:"rates"`
}

type ConvertCurrencyResponse struct {
	Assets      []float64 `json:"assets"`
	Liabilities []float64 `json:"liabilities"`
	Monthly     []float64 `json:"monthly"`
}

type Data struct {
	Assets      []float64 `json:"assets"`
	Liabilities []float64 `json:"liabilities"`
	Monthly     []float64 `json:"monthly"`
	From        string    `json:"from"`
}

func calculateAssets(assets []float64) float64 {
	var total float64
	for _, asset := range assets {
		total = total + asset
	}
	return total
}

func calculateLiabilities(liabilities []float64) float64 {
	var total float64
	for _, liability := range liabilities {
		total = total + liability
	}
	return total
}

func getExchangeRate(from, to string) (float64, error) {
	rsp, err := http.Get("https://api.exchangerate-api.com/v4/latest/" + from)
	if err != nil {
		return 0, err
	}
	defer rsp.Body.Close()

	b, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		return 0, err
	}

	var rate CurrencyRate
	err = json.Unmarshal(b, &rate)
	if err != nil {
		return 0, err
	}

	return rate.Rates[to], nil
}

func convertCurrencyHandler(w http.ResponseWriter, r *http.Request) {
	var req Data

	b, _ := ioutil.ReadAll(r.Body)
	err := json.Unmarshal(b, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var (
		wg              sync.WaitGroup
		currencies      = strings.Split(req.From, "/")
		from, to        = currencies[0], currencies[1]
		convAssets      = make([]float64, 0)
		convLiabilities = make([]float64, 0)
		convMonthly     = make([]float64, 0)
	)
	rate, err := getExchangeRate(from, to)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	wg.Add(3)
	go func() {
		defer wg.Done()
		for _, amount := range req.Assets {
			convAssets = append(convAssets, math.Round((amount*rate)*100)/100)
		}
	}()

	go func() {
		defer wg.Done()
		for _, amount := range req.Liabilities {
			convLiabilities = append(convLiabilities, math.Round((amount*rate)*100)/100)
		}
	}()

	go func() {
		defer wg.Done()
		for _, amount := range req.Monthly {
			convMonthly = append(convMonthly, math.Round((amount*rate)*100)/100)
		}
	}()
	wg.Wait()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	rsp := ConvertCurrencyResponse{
		Assets:      convAssets,
		Liabilities: convLiabilities,
		Monthly:     convMonthly,
	}

	if err := json.NewEncoder(w).Encode(rsp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func netWorthHandler(w http.ResponseWriter, r *http.Request) {
	var req Data

	b, _ := ioutil.ReadAll(r.Body)
	err := json.Unmarshal(b, &req)
	if err != nil {
		fmt.Println(err)
	}

	assets := calculateAssets(req.Assets)
	liabilities := calculateLiabilities(req.Liabilities)

	nw := &NetWorth{
		TotalAssets:      assets,
		TotalLiabilities: liabilities,
		TotalNetWorth:    assets - liabilities,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(nw); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func handleRequests() {
	r := mux.NewRouter()
	r.HandleFunc("/api", netWorthHandler).Methods("POST")
	r.HandleFunc("/api/currency", convertCurrencyHandler).Methods("POST")
	log.Fatal(http.ListenAndServe(":3000", r))
}

func main() {
	handleRequests()
}
