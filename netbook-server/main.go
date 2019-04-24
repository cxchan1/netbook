package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

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

type FormData struct {
	Assets      []float64 `json:"assets"`
	Liabilities []float64 `json:"liabilities"`
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
	//from, to = _, _
	//fmt.Println(getExchangeRate(from, to))
}

func netWorthHandler(w http.ResponseWriter, r *http.Request) {
	//var a, l []interface{}
	var x FormData

	// json.Unmarshal([]byte(r.FormValue("assets")), &a)
	// json.Unmarshal([]byte(r.FormValue("liabilities")), &l)

	b, _ := ioutil.ReadAll(r.Body)
	fmt.Println(string(b))
	err := json.Unmarshal(b, &x)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(x)

	assets := calculateAssets(x.Assets)
	liabilities := calculateLiabilities(x.Liabilities)

	nw := &NetWorth{
		TotalAssets:      assets,
		TotalLiabilities: liabilities,
		TotalNetWorth:    assets - liabilities,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(nw); err !=    nil {
    panic(err)
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
