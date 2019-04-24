package main

import (
	"encoding/json"
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

func calculateAssets(assets []interface{}) float64 {
	var total float64
	for _, asset := range assets {
		switch a := asset.(type) {
		case float64:
			total = total + a
		case AssetAndLiability:
			total = total + a.Amount
		}
	}
	return total
}

func calculateLiabilities(liabilities []interface{}) float64 {
	var total float64
	for _, liability := range liabilities {
		switch l := liability.(type) {
		case float64:
			total = total + l
		case AssetAndLiability:
			total = total + l.Amount
		}
	}
	return total
}

func netWorthHandler(w http.ResponseWriter, r *http.Request) {
	var a, l []interface{}

	json.Unmarshal([]byte(r.FormValue("assets")), &a)
	json.Unmarshal([]byte(r.FormValue("liabilities")), &l)

	assets := calculateAssets(a)
	liabilities := calculateLiabilities(l)

	nw := &NetWorth{
		TotalAssets:      assets,
		TotalLiabilities: liabilities,
		TotalNetWorth:    assets - liabilities,
	}

	json.NewEncoder(w).Encode(nw)
}

func handleRequests() {
	r := mux.NewRouter()
	r.HandleFunc("/api", netWorthHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(":3000", r))
}

func main() {
	handleRequests()
}
