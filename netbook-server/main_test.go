package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"math"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
)

func TestCalculateAssets(t *testing.T) {
	var assets = [][]float64{
		[]float64{3000.00, 200.50, 100.00},
		[]float64{},
		[]float64{1, 2, 3},
	}
	var results = make([]float64, len(assets))

	for i, asset := range assets {
		for j := 0; j < len(asset); j++ {
			results[i] = results[i] + asset[j]
		}
		if total := calculateAssets(asset); total != results[i] {
			t.Errorf("Total assets for %v is incorrect. Expected %v and got %v\n", asset, results[i], total)
		}
	}
}

func TestCalculateLiabilities(t *testing.T) {
	var liabilities = [][]float64{
		[]float64{50000.00, 3200.42, 150000.25, 100.00, 846.50},
		[]float64{},
		[]float64{2, 4, 6, 8},
	}
	var results = make([]float64, len(liabilities))

	for i, liability := range liabilities {
		for j := 0; j < len(liability); j++ {
			results[i] = results[i] + liability[j]
		}
		if total := calculateLiabilities(liability); total != results[i] {
			t.Errorf("Total liabilities for %v is incorrect. Expected %v and got %v\n", liability, results[i], total)
		}
	}
}

func TestConvertCurrencyHandler(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(convertCurrencyHandler))
	defer server.Close()

	rsp, err := http.Post(server.URL, "application/json", bytes.NewReader([]byte(`{"assets": [1, 10, 100], "liabilities": [2, 20, 200], "monthly": [3, 30, 300], "from": "CAD/JPY"}`)))
	if err != nil {
		t.Errorf("Response failed: %v\n", err)
	}

	b, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		t.Errorf("Failed to read body: %v\n", err)
	}
	defer rsp.Body.Close()

	res, err := http.Get("https://api.exchangerate-api.com/v4/latest/CAD")
	if err != nil {
		t.Errorf("Response failed: %v\n", err)
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		t.Errorf("Failed to read response body: %v\n", err)
	}

	var rate CurrencyRate
	err = json.Unmarshal(body, &rate)
	if err != nil {
		t.Errorf("Failed to parse json: %v\n", err)
	}

	currencyRate := rate.Rates["JPY"]

	var (
		wg              sync.WaitGroup
		convAssets      = make([]float64, 0)
		convLiabilities = make([]float64, 0)
		convMonthly     = make([]float64, 0)
	)

	wg.Add(3)
	go func() {
		defer wg.Done()
		for _, amount := range []float64{1, 10, 100} {
			convAssets = append(convAssets, math.Round((amount*currencyRate)*100)/100)
		}
	}()

	go func() {
		defer wg.Done()
		for _, amount := range []float64{2, 20, 200} {
			convLiabilities = append(convLiabilities, math.Round((amount*currencyRate)*100)/100)
		}
	}()

	go func() {
		defer wg.Done()
		for _, amount := range []float64{3, 30, 300} {
			convMonthly = append(convMonthly, math.Round((amount*currencyRate)*100)/100)
		}
	}()
	wg.Wait()

	convertResponse := ConvertCurrencyResponse{
		Assets:      convAssets,
		Liabilities: convLiabilities,
		Monthly:     convMonthly,
	}

	byt, err := json.Marshal(convertResponse)
	if err != nil {
		t.Errorf("Failed to marshal json: %v\n", err)
	}

	if strings.TrimSpace(string(b)) != string(byt) {
		t.Errorf("Conversion is incorrect")
	}
}

func TestNetWorthHandler(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(netWorthHandler))
	defer server.Close()

	rsp, err := http.Post(server.URL, "application/json", bytes.NewReader([]byte(`{"assets": [100, 200, 300], "liabilities": [50, 100]}`)))
	if err != nil {
		t.Errorf("Response failed: %v\n", err)
	}

	b, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		t.Errorf("Failed to read body: %v\n", err)
	}
	defer rsp.Body.Close()

	if strings.TrimSpace(string(b)) != `{"totalAssets":600,"totalLiabilities":150,"totalNetWorth":450}` {
		t.Errorf("The total assets, total liabilities, and total net worth are incorrect")
	}
}
