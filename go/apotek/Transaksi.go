package main

import (
	"apotek/helper"
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type JTransaksiRequest struct {
	Username string
	ParamKey string
	Method string
	Id int
	TotalHarga int
	Diskon int
	TotalBayar int
	MetodePembayaran string
	Kasir string
	TransaksiDetail []JTransaksiDetailRequest
	Page        int
	RowPage     int
	OrderBy     string
	Order       string
}

type JTransaksiDetailRequest struct {
	KodeObat string
	NamaObat string
	Jumlah int
	HargaSatuan int
	SubTotal int
	Supplier string
}

type JTransaksiResponse struct {
	Id string
	KodeTransaksi string
	NamaTransaksi string
	Supplier string
	Status string
	Satuan string
	Kategori string
}

func Transaksi(c *gin.Context) {
	db := helper.Connect(c)
	defer db.Close()
	startTime := time.Now()
	startTimeString := startTime.String()

	var (
		bodyBytes []byte
		xRealIp   string
		ip        string
		logFile   string
		totalRecords float64
		totalPage float64
	)

	jTransaksiRequest := JTransaksiRequest{}
	jTransaksiResponse := JTransaksiResponse{}
	jTransaksiResponses := []JTransaksiResponse{}

	errorCode := "1"
	errorMessage := ""
	errorCodeSession := "2"
	errorMessageSession := "Session Expired"
	// errorCodeAccess := "3"
	// errorMessageAccess := "Access Denied"

	allHeader := helper.ReadAllHeader(c)
	logFile = os.Getenv("LOGFILE")
	method := c.Request.Method
	path := c.Request.URL.EscapedPath()

	// ---------- start get ip ----------
	if Values, _ := c.Request.Header["X-Real-Ip"]; len(Values) > 0 {
		xRealIp = Values[0]
	}

	if xRealIp != "" {
		ip = xRealIp
	} else {
		ip = c.ClientIP()
	}
	// ---------- end of get ip ----------

	// ---------- start log file ----------
	dateNow := startTime.Format("2006-01-02")
	logFile = logFile + "Transaksi_" + dateNow + ".log"
	file, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	log.SetOutput(file)
	// ---------- end of log file ----------

	// ------ start body json validation ------
	if c.Request.Body != nil {
		bodyBytes, _ = ioutil.ReadAll(c.Request.Body)
	}
	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
	bodyString := string(bodyBytes)

	bodyJson := helper.TrimReplace(string(bodyString))
	logData := startTimeString + "~" + ip + "~" + method + "~" + path + "~" + allHeader + "~"
	rex := regexp.MustCompile(`\r?\n`)
	logData = logData + rex.ReplaceAllString(bodyJson, "") + "~"

	if string(bodyString) == "" {
		errorMessage = "Error, Body is empty"
		dataLogTransaksi(jTransaksiResponses, jTransaksiRequest.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}

	IsJson := helper.IsJson(bodyString)
	if !IsJson {
		errorMessage = "Error, Body - invalid json data"
		dataLogTransaksi(jTransaksiResponses, jTransaksiRequest.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}
	// ------ end of body json validation ------

	// ------ Header Validation ------
	if helper.ValidateHeader(bodyString, c) {
		if err := c.ShouldBindJSON(&jTransaksiRequest); err != nil {
			errorMessage = "Error, Bind Json Data"
			dataLogTransaksi(jTransaksiResponses, jTransaksiRequest.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
			return
		} else {
			username := jTransaksiRequest.Username
			paramKey := jTransaksiRequest.ParamKey
			method := jTransaksiRequest.Method
			id := jTransaksiRequest.Id
			totalHarga := jTransaksiRequest.TotalHarga
			diskon := jTransaksiRequest.Diskon
			totalBayar := jTransaksiRequest.TotalBayar
			metodePembayaran := jTransaksiRequest.MetodePembayaran
			kasir := jTransaksiRequest.Kasir
			page := jTransaksiRequest.Page
			rowPage := jTransaksiRequest.RowPage

			// ------ Param Validation ------
			if username == "" {
				errorMessage += "Username can't null value"
			}

			if paramKey == "" {
				errorMessage += "ParamKey can't null value"
			}

			if method == "" {
				errorMessage += "Method can't null value"
			}

			if method == "SELECT" {
				if page == 0 {
					errorMessage += "Page can't null or 0 value"
				}
	
				if rowPage == 0 {
					errorMessage += "Page can't null or 0 value"
				}
			}

			if errorMessage != "" {
				dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
			// ------ end of Param Validation ------

			// ------ start check session paramkey ------
			checkAccessVal := helper.CheckSession(username, paramKey, c)
			if checkAccessVal != "1" {
				dataLogTransaksi(jTransaksiResponses, username, errorCodeSession, errorMessageSession, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}

			if method == "INSERT" {

				maxCounter := 0
				query := "SELECT IFNULL(MAX(counter), 0) FROM db_transaksi WHERE tgl_transaksi >= DATE_FORMAT(NOW(), '%Y-%m-01') AND tgl_transaksi <  DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH);"
				if err := db.QueryRow(query).Scan(&maxCounter); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				maxCounter += 1
				counterFormatted := fmt.Sprintf("%03d", maxCounter)

				suffix := "TRX"
				part1 := helper.GetDate("dmYhis")
				part2, _ := helper.GenerateRandomString(4)
				trxId := fmt.Sprintf("%s-%s-%s", suffix, part1, part2)

				// INV/2026/02/08/001
				suffixInv := "INV"
				year := startTime.Year()
				month := startTime.Month()
				monthString := helper.GetMonthInt(month.String())
				day := startTime.Day()
				dayString := strconv.Itoa(day)
				dayStringNew := ""
				if day < 10 {
					dayStringNew = "0" + dayString
				} else {
					dayStringNew = dayString
				}

				nomorInvoice := fmt.Sprintf("%s/%d/%s/%s/%s", suffixInv, year, monthString, dayStringNew, counterFormatted)

				query1 := fmt.Sprintf("INSERT INTO db_Transaksi (trx_id, tgl_transaksi, total_harga, diskon, total_bayar, metode_pembayaran, kasir, counter, nomor_invoice) VALUES ('%s',NOW(),'%d','%d','%d','%s','%s','%d','%s')", trxId, totalHarga, diskon, totalBayar, metodePembayaran, kasir, maxCounter, nomorInvoice)
				_, err1 := db.Exec(query1)
				if err1 != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err1)
					dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				listDetailTransaksi := jTransaksiRequest.TransaksiDetail
				for _, item := range listDetailTransaksi {

					kodeObat := item.KodeObat
					jumlah := item.Jumlah
					hargaSatuan := item.HargaSatuan
					subTotal := item.SubTotal
					supplier := item.Supplier

					query := fmt.Sprintf("INSERT INTO db_Transaksi_detail (trx_id, kode_obat, jumlah, harga_satuan, sub_total, supplier, tgl_input) VALUES ('%s','%s','%d','%d','%d','%s', NOW())", trxId, kodeObat, jumlah, hargaSatuan, subTotal, supplier)
					_, err := db.Exec(query)
					if err != nil {
						paramKey = ""
						errorMessage = fmt.Sprintf("Error running %q: %+v", query, err)
						dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}

				dataLogTransaksi(jTransaksiResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			} else if method == "UPDATE" {

			} else if method == "DELETE" {

			} else if method == "SELECT" {

				pageNow := (page - 1) * rowPage
				pageNowString := strconv.Itoa(pageNow)
				queryLimit := ""

				queryWhere := ""
				if id != 0 {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" id = '%d' ", id)
				}

				if queryWhere != "" {
					queryWhere = " WHERE " + queryWhere
				}

				totalRecords = 0
				totalPage = 0
				query := fmt.Sprintf("SELECT COUNT(1) AS cnt FROM db_Transaksi %s", queryWhere)
				if err := db.QueryRow(query).Scan(&totalRecords); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if rowPage == -1 {
					queryLimit = ""
					totalPage = 1
				} else {
					rowPageString := strconv.Itoa(rowPage)
					queryLimit = "LIMIT " + pageNowString + "," + rowPageString
					totalPage = math.Ceil(float64(totalRecords) / float64(rowPage))
				}

				// ---------- start query get menu ----------
				query1 := fmt.Sprintf("SELECT a.id, kode_Transaksi, nama_Transaksi, b.supplier, a.status, c.satuan, d.kategori FROM db_Transaksi a, db_supplier b, db_satuan c, db_kategori d %s %s", queryWhere, queryLimit)
				rows, err := db.Query(query1)
				defer rows.Close()
				if err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				for rows.Next() {
					err = rows.Scan(
						&jTransaksiResponse.Id,
						&jTransaksiResponse.KodeTransaksi,
						&jTransaksiResponse.NamaTransaksi,
						&jTransaksiResponse.Supplier,
						&jTransaksiResponse.Status,
						&jTransaksiResponse.Satuan,
						&jTransaksiResponse.Kategori,
					)

					jTransaksiResponses = append(jTransaksiResponses, jTransaksiResponse)

					if err != nil {
						errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
						dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}
				// ---------- end of query get menu ----------

				dataLogTransaksi(jTransaksiResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else {
				errorMessage = "Method undifined!"
				dataLogTransaksi(jTransaksiResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
		}
	}
}

func dataLogTransaksi(jTransaksiResponses []JTransaksiResponse, username string, errorCode string, errorMessage string, totalRecords float64, totalPage float64, method string, path string, ip string, logData string, allHeader string, bodyJson string, c *gin.Context) {
	if errorCode != "0" {
		helper.SendLogError(username, "Transaksi", errorMessage, bodyJson, "", errorCode, allHeader, method, path, ip, c)
	}
	returnTransaksi(jTransaksiResponses, errorCode, errorMessage, logData, totalRecords, totalPage, c)
}

func returnTransaksi(jTransaksiResponses []JTransaksiResponse, errorCode string, errorMessage string, logData string, totalRecords float64, totalPage float64, c *gin.Context) {

	if strings.Contains(errorMessage, "Error running") {
		errorMessage = "Error Execute data"
	}

	if errorCode == "504" {
		c.String(http.StatusUnauthorized, "")
	} else {
		currentTime := time.Now()
		currentTime1 := currentTime.Format("01/02/2006 15:04:05")

		c.PureJSON(http.StatusOK, gin.H{
			"ErrorCode":    errorCode,
			"ErrorMessage": errorMessage,
			"DateTime":   currentTime1,
			"TotalRecords":   totalRecords,
			"TotalPage":   totalPage,
			"Result": jTransaksiResponses, 
		})
	}

	startTime := time.Now()

	rex := regexp.MustCompile(`\r?\n`)
	endTime := time.Now()
	codeError := "200"

	diff := endTime.Sub(startTime)

	logDataNew := rex.ReplaceAllString(logData + codeError + "~" + endTime.String() + "~" + diff.String() + "~" + errorMessage, "")
	log.Println(logDataNew)

	runtime.GC()
}
