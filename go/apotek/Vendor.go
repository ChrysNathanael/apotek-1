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

type JVendorRequest struct {
	Username string
	ParamKey string
	Method   string
	Id       int
	Status   string
	Page     int
	RowPage  int
	OrderBy  string
	Order    string

	KodeVendor    string
	NamaVendor    string
	NomorTelepon  string
	NomorRekening string
	Alamat        string
}

type JVendorResponse struct {
	Id            int
	KodeVendor    string
	NamaVendor    string
	NomorTelepon  string
	NomorRekening string
	Alamat        string
	Status        int
}

func Vendor(c *gin.Context) {
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

	reqBody := JVendorRequest{}
	jVendorResponse := JVendorResponse{}
	jVendorResponses := []JVendorResponse{}

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
	logFile = logFile + "Vendor_" + dateNow + ".log"
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
		dataLogVendor(jVendorResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}

	IsJson := helper.IsJson(bodyString)
	if !IsJson {
		errorMessage = "Error, Body - invalid json data"
		dataLogVendor(jVendorResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}
	// ------ end of body json validation ------

	// ------ Header Validation ------
	if helper.ValidateHeader(bodyString, c) {
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			errorMessage = "Error, Bind Json Data"
			dataLogVendor(jVendorResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
			return
		} else {
			username := reqBody.Username
			paramKey := reqBody.ParamKey
			method := reqBody.Method
			id := reqBody.Id
			// kodeVendor := reqBody.KodeVendor
			namaVendor := reqBody.NamaVendor
			nomorTelepon := reqBody.NomorTelepon
			nomorRekening := reqBody.NomorRekening
			alamat := reqBody.Alamat
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
				dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
			// ------ end of Param Validation ------

			// ------ start check session paramkey ------
			checkAccessVal := helper.CheckSession(username, paramKey, c)
			if checkAccessVal != "1" {
				dataLogVendor(jVendorResponses, username, errorCodeSession, errorMessageSession, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}

			if method == "INSERT" {
				if namaVendor == "" {
					errorMessage += "Nama Vendor tidak boleh kosong!"
				}
				if nomorRekening == "" {
					errorMessage += "Nama Rekening tidak boleh kosong!"
				}
				if alamat == "" {
					errorMessage += "alamat tidak boleh kosong!"
				}
				if nomorTelepon == "" {
					errorMessage += "Nomor Telepon tidak boleh kosong!"
				}

				if errorMessage != "" {
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				kodeVendor, _ := helper.GenerateRandomString(6)

				var cekVendor int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_vendor WHERE nama_vendor = '%s'", namaVendor)
				err := db.QueryRow(queryCheck).Scan(&cekVendor)
				if err != nil {
					errorMessage = err.Error()
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if cekVendor > 0 {
					errorMessage = "Vendor sudah terdaftar"
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				// ------ Insert Query ------

				queryInsert := fmt.Sprintf("INSERT INTO db_vendor (kode_vendor, nama_vendor, status, nomor_telepon, nomor_rekening, alamat, tgl_input) values ('%s','%s','1','%s','%s','%s', NOW())", kodeVendor, namaVendor, nomorTelepon, nomorRekening, alamat)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogVendor(jVendorResponses, username, "0", "Insert berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else if method == "UPDATE" {
				if namaVendor == "" {
					errorMessage += "Nama Vendor tidak boleh kosong!"
				}
				if nomorRekening == "" {
					errorMessage += "Nama Rekening tidak boleh kosong!"
				}
				if alamat == "" {
					errorMessage += "alamat tidak boleh kosong!"
				}
				if nomorTelepon == "" {
					errorMessage += "Nomor Telpon tidak boleh kosong!"
				}

				if errorMessage != "" {
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryInsert := fmt.Sprintf("UPDATE db_vendor SET nama_vendor = '%s', nomor_telepon = '%s', nomor_rekening = '%s', alamat= '%s' WHERE id = '%d'", namaVendor, nomorTelepon, nomorRekening, alamat, id)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				dataLogVendor(jVendorResponses, username, "0", "Update berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			} else if method == "DELETE" {
				var cekVendor int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_vendor WHERE id = '%d'", id)
				err := db.QueryRow(queryCheck).Scan(&cekVendor)
				if err != nil {
					errorMessage = err.Error()
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryDelete := fmt.Sprintf("UPDATE db_vendor SET status = '%s' WHERE id = '%d'", status, id)
				_, errInsert := db.Exec(queryDelete)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryDelete, errInsert)
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogVendor(jVendorResponses, username, "0", "Delete berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

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

				if namaVendor != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}
					queryWhere += fmt.Sprintf(" nama_vendor LIKE '%%%s%%' ", namaVendor)
				}

				if nomorTelepon != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}
					queryWhere += fmt.Sprintf(" nomor_telepon LIKE '%%%s%%' ", nomorTelepon)
				}

				if status != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}
					queryWhere += fmt.Sprintf(" status = '%s' ", status)
				}

				if queryWhere != "" {
					queryWhere = " WHERE " + queryWhere
				}

				totalRecords = 0
				totalPage = 0
				query := fmt.Sprintf("SELECT COUNT(1) AS cnt FROM db_vendor %s", queryWhere)
				if err := db.QueryRow(query).Scan(&totalRecords); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
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
				query1 := fmt.Sprintf("SELECT id, nama_vendor, kode_vendor, ifnull(nomor_telepon,''), ifnull(nomor_rekening,'') ,ifnull(alamat,''), status FROM db_vendor %s %s", queryWhere, queryLimit)
				// fmt.Println(query1)
				rows, err := db.Query(query1)
				defer rows.Close()
				if err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				for rows.Next() {
					err = rows.Scan(
						&jVendorResponse.Id,
						&jVendorResponse.NamaVendor,
						&jVendorResponse.KodeVendor,
						&jVendorResponse.NomorTelepon,
						&jVendorResponse.NomorRekening,
						&jVendorResponse.Alamat,
						&jVendorResponse.Status,
					)

					jVendorResponses = append(jVendorResponses, jVendorResponse)

					if err != nil {
						errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
						dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}
				// ---------- end of query get menu ----------

				dataLogVendor(jVendorResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else {
				errorMessage = "Method undifined!"
				dataLogVendor(jVendorResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
		}
	}
}

func dataLogVendor(jVendorResponses []JVendorResponse, username string, errorCode string, errorMessage string, totalRecords float64, totalPage float64, method string, path string, ip string, logData string, allHeader string, bodyJson string, c *gin.Context) {
	if errorCode != "0" {
		helper.SendLogError(username, "Vendor", errorMessage, bodyJson, "", errorCode, allHeader, method, path, ip, c)
	}
	returnVendor(jVendorResponses, errorCode, errorMessage, logData, totalRecords, totalPage, c)
}

func returnVendor(jVendorResponses []JVendorResponse, errorCode string, errorMessage string, logData string, totalRecords float64, totalPage float64, c *gin.Context) {

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
			"Result":       jVendorResponses,
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
