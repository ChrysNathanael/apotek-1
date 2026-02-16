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

type JSatuanRequest struct {
	Username string
	ParamKey string
	Method   string
	Id       string
	Page     int
	RowPage  int
	OrderBy  string
	Order    string

	Satuan string
	Status int
}

type JSatuanResponse struct {
	Id     string
	Satuan string
	Status int
}

func Satuan(c *gin.Context) {
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

	reqBody := JSatuanRequest{}
	jSatuanResponse := JSatuanResponse{}
	jSatuanResponses := []JSatuanResponse{}

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
	logFile = logFile + "Satuan_" + dateNow + ".log"
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
		dataLogSatuan(jSatuanResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}

	IsJson := helper.IsJson(bodyString)
	if !IsJson {
		errorMessage = "Error, Body - invalid json data"
		dataLogSatuan(jSatuanResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}
	// ------ end of body json validation ------

	// ------ Header Validation ------
	if helper.ValidateHeader(bodyString, c) {
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			errorMessage = "Error, Bind Json Data"
			dataLogSatuan(jSatuanResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
			return
		} else {
			username := reqBody.Username
			paramKey := reqBody.ParamKey
			method := reqBody.Method
			id := reqBody.Id
			Satuan := reqBody.Satuan
			status := reqBody.Status
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
				dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
			// ------ end of Param Validation ------

			// ------ start check session paramkey ------
			checkAccessVal := helper.CheckSession(username, paramKey, c)
			if checkAccessVal != "1" {
				dataLogSatuan(jSatuanResponses, username, errorCodeSession, errorMessageSession, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}

			if method == "INSERT" {
				if Satuan == "" {
					errorMessage += "Satuan tidak boleh kosong!"
				}

				if errorMessage != "" {
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				var cekSatuan int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_satuan WHERE satuan = '%s'", Satuan)
				err := db.QueryRow(queryCheck).Scan(&cekSatuan)
				if err != nil {
					errorMessage = err.Error()
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if cekSatuan > 0 {
					errorMessage = "Satuan Obat sudah terdaftar"
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				// ------ Insert Query ------

				queryInsert := fmt.Sprintf("INSERT INTO db_satuan (satuan, status, tgl_input) values ('%s','1', NOW())", Satuan)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogSatuan(jSatuanResponses, username, "0", "Insert berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else if method == "UPDATE" {

			} else if method == "DELETE" {
				var cekSatuan int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_satuan WHERE id = '%d'", id)
				err := db.QueryRow(queryCheck).Scan(&cekSatuan)
				if err != nil {
					errorMessage = err.Error()
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryDelete := fmt.Sprintf("DELETE FROM db_satuan WHERE id = '%s'", id)
				_, errInsert := db.Exec(queryDelete)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryDelete, errInsert)
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogSatuan(jSatuanResponses, username, "0", "Delete berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			} else if method == "SELECT" {
				pageNow := (page - 1) * rowPage
				pageNowString := strconv.Itoa(pageNow)
				queryLimit := ""

				queryWhere := ""
				if id != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" id = '%s' ", id)
				}

				if Satuan != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" Satuan LIKE '%%%s%%' ", Satuan)
				}

				if status != 0 {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" status = '%d' ", status)
				}
				queryWhere += " status = 1 "

				if queryWhere != "" {
					queryWhere = " WHERE " + queryWhere
				}

				totalRecords = 0
				totalPage = 0
				query := fmt.Sprintf("SELECT COUNT(1) AS cnt FROM db_satuan %s", queryWhere)
				if err := db.QueryRow(query).Scan(&totalRecords); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
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
				query1 := fmt.Sprintf("SELECT id, satuan, status FROM db_satuan %s %s", queryWhere, queryLimit)
				rows, err := db.Query(query1)
				defer rows.Close()
				if err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				for rows.Next() {
					err = rows.Scan(
						&jSatuanResponse.Id,
						&jSatuanResponse.Satuan,
						&jSatuanResponse.Status,
					)

					jSatuanResponses = append(jSatuanResponses, jSatuanResponse)

					if err != nil {
						errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
						dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}
				// ---------- end of query get menu ----------

				dataLogSatuan(jSatuanResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else {
				errorMessage = "Method undifined!"
				dataLogSatuan(jSatuanResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
		}
	}
}

func dataLogSatuan(jSatuanResponses []JSatuanResponse, username string, errorCode string, errorMessage string, totalRecords float64, totalPage float64, method string, path string, ip string, logData string, allHeader string, bodyJson string, c *gin.Context) {
	if errorCode != "0" {
		helper.SendLogError(username, "Satuan", errorMessage, bodyJson, "", errorCode, allHeader, method, path, ip, c)
	}
	returnSatuan(jSatuanResponses, errorCode, errorMessage, logData, totalRecords, totalPage, c)
}

func returnSatuan(jSatuanResponses []JSatuanResponse, errorCode string, errorMessage string, logData string, totalRecords float64, totalPage float64, c *gin.Context) {

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
			"Result":       jSatuanResponses,
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
