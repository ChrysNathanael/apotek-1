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

type JObatRequest struct {
	Username string
	ParamKey string
	Method   string
	Id       int
	KodeObat string
	NamaObat string
	Supplier string
	Status   string
	Satuan   string
	Kategori string
	Page     int
	RowPage  int
	OrderBy  string
	Order    string
}

type JObatResponse struct {
	Id       int
	KodeObat string
	NamaObat string
	Supplier string
	Status   string
	Satuan   string
	Kategori string
}

func Obat(c *gin.Context) {
	db := helper.Connect(c)
	defer db.Close()
	startTime := time.Now()
	startTimeString := startTime.String()

	var (
		bodyBytes    []byte
		xRealIp      string
		ip           string
		logFile      string
		totalRecords float64
		totalPage    float64
	)

	reqBody := JObatRequest{}
	jObatResponse := JObatResponse{}
	jObatResponses := []JObatResponse{}

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
	logFile = logFile + "Obat_" + dateNow + ".log"
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
		dataLogObat(jObatResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}

	IsJson := helper.IsJson(bodyString)
	if !IsJson {
		errorMessage = "Error, Body - invalid json data"
		dataLogObat(jObatResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}
	// ------ end of body json validation ------

	// ------ Header Validation ------
	if helper.ValidateHeader(bodyString, c) {
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			errorMessage = "Error, Bind Json Data"
			dataLogObat(jObatResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
			return
		} else {
			username := reqBody.Username
			paramKey := reqBody.ParamKey
			method := reqBody.Method
			id := reqBody.Id
			kodeObat := reqBody.KodeObat
			namaObat := reqBody.NamaObat
			supplier := reqBody.Supplier
			status := reqBody.Status
			satuan := reqBody.Satuan
			kategori := reqBody.Kategori
			orderBy := reqBody.OrderBy
			order := reqBody.Order
			page := reqBody.Page
			rowPage := reqBody.RowPage

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
				dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
			// ------ end of Param Validation ------

			// ------ start check session paramkey ------
			checkAccessVal := helper.CheckSession(username, paramKey, c)
			if checkAccessVal != "1" {
				dataLogObat(jObatResponses, username, errorCodeSession, errorMessageSession, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}

			switch method {
			case "INSERT":

				if namaObat == "" {
					errorMessage += "Nama Obat tidak boleh kosong!"
				}
				if supplier == "" {
					errorMessage += "Supplier tidak boleh kosong!"
				}
				if satuan == "" {
					errorMessage += "Satuan tidak boleh kosong!"
				}
				if kategori == "" {
					errorMessage += "Kategori tidak boleh kosong!"
				}

				if errorMessage != "" {
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				kodeObat, _ := helper.GenerateRandomString(6)

				// ------ Insert Query ------

				queryInsert := fmt.Sprintf("INSERT INTO db_obat (kode_obat, nama_obat, supplier, status, satuan, kategori, tgl_input) values ('%s',%s','%s','1','%s','%s',NOW())", kodeObat, namaObat, supplier, satuan, kategori)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogObat(jObatResponses, username, "0", "Insert berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			case "UPDATE":

				if id == 0 {
					errorMessage = "Id tidak boleh kosong"
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				countObat := 0
				queryCheck := fmt.Sprintf("SELECT COUNT(1) FROM db_obat WHERE kode_obat = '%s'", kodeObat)
				err := db.QueryRow(queryCheck).Scan(&countObat)
				if err != nil {
					errorMessage = err.Error()
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if countObat < 1 {
					errorMessage = "Obat tidak ditemukan"
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryUpdate := ""

				if namaObat != "" {
					queryUpdate += fmt.Sprintf(" , nama_obat = '%s' ", namaObat)
				}
				if supplier == "" {
					queryUpdate += fmt.Sprintf(" , supplier = '%s' ", supplier)
				}
				if status == "" {
					queryUpdate += fmt.Sprintf(" , status = '%s' ", status)
				}
				if satuan == "" {
					queryUpdate += fmt.Sprintf(" , satuan = '%s' ", satuan)
				}
				if kategori == "" {
					queryUpdate += fmt.Sprintf(" , kategori = '%s' ", kategori)
				}

				if errorMessage != "" {
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryInsert := fmt.Sprintf("UPDATE db_obat SET tgl_update = NOW() %s WHERE id = %d", queryUpdate, id)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				dataLogObat(jObatResponses, username, "0", "Update berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			case "DELETE":

				if id == 0 {
					errorMessage = "Id tidak boleh kosong"
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				countObat := 0
				queryCheck := fmt.Sprintf("SELECT COUNT(1) FROM db_obat WHERE kode_obat = '%s'", kodeObat)
				err := db.QueryRow(queryCheck).Scan(&countObat)
				if err != nil {
					errorMessage = err.Error()
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if countObat < 1 {
					errorMessage = "Obat tidak ditemukan"
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryDelete := fmt.Sprintf("UPDATE db_obat SET status = '%s' WHERE id = %d", status, id)
				_, errInsert := db.Exec(queryDelete)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryDelete, errInsert)
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogObat(jObatResponses, username, "0", "Delete berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			case "SELECT":
				pageNow := (page - 1) * rowPage
				pageNowString := strconv.Itoa(pageNow)
				queryLimit := ""

				queryWhere := " a.supplier = b.id AND a.satuan = c.id AND a.kategori = d.id "
				if id != 0 {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" a.id = %d ", id)
				}

				if namaObat != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" nama_obat LIKE '%%%s%%' ", namaObat)
				}

				if supplier != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" b.supplier LIKE '%%%s%%' ", supplier)
				}

				if status != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" a.status = '%s' ", status)
				}

				if queryWhere != "" {
					queryWhere = " WHERE " + queryWhere
				}

				queryOrder := ""
				if orderBy == "" {
					queryOrder = " ORDER BY a.tgl_input DESC "
				} else {
					queryOrder = fmt.Sprintf(" ORDER BY %s %s ", orderBy, order)
				}

				totalRecords = 0
				totalPage = 0
				query := fmt.Sprintf("SELECT COUNT(1) AS cnt FROM db_obat a, db_supplier b, db_satuan c, db_kategori d %s", queryWhere)
				if err := db.QueryRow(query).Scan(&totalRecords); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
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
				query1 := fmt.Sprintf("SELECT a.id, kode_obat, nama_obat, b.supplier, a.status, c.satuan, d.kategori FROM db_obat a, db_supplier b, db_satuan c, db_kategori d %s %s %s", queryWhere, queryOrder, queryLimit)
				rows, err := db.Query(query1)
				defer rows.Close()
				if err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				for rows.Next() {
					err = rows.Scan(
						&jObatResponse.Id,
						&jObatResponse.KodeObat,
						&jObatResponse.NamaObat,
						&jObatResponse.Supplier,
						&jObatResponse.Status,
						&jObatResponse.Satuan,
						&jObatResponse.Kategori,
					)

					jObatResponses = append(jObatResponses, jObatResponse)

					if err != nil {
						errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
						dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}
				// ---------- end of query get menu ----------

				dataLogObat(jObatResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			default:
				errorMessage = "Method undifined!"
				dataLogObat(jObatResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
		}
	}
}

func dataLogObat(jObatResponses []JObatResponse, username string, errorCode string, errorMessage string, totalRecords float64, totalPage float64, method string, path string, ip string, logData string, allHeader string, bodyJson string, c *gin.Context) {
	if errorCode != "0" {
		helper.SendLogError(username, "OBAT", errorMessage, bodyJson, "", errorCode, allHeader, method, path, ip, c)
	}
	returnObat(jObatResponses, errorCode, errorMessage, logData, totalRecords, totalPage, c)
}

func returnObat(jObatResponses []JObatResponse, errorCode string, errorMessage string, logData string, totalRecords float64, totalPage float64, c *gin.Context) {

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
			"DateTime":     currentTime1,
			"TotalRecords": totalRecords,
			"TotalPage":    totalPage,
			"Result":       jObatResponses,
		})
	}

	startTime := time.Now()

	rex := regexp.MustCompile(`\r?\n`)
	endTime := time.Now()
	codeError := "200"

	diff := endTime.Sub(startTime)

	logDataNew := rex.ReplaceAllString(logData+codeError+"~"+endTime.String()+"~"+diff.String()+"~"+errorMessage, "")
	log.Println(logDataNew)

	runtime.GC()
}
