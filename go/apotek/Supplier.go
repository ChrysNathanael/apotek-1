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

type JSupplierRequest struct {
	Username string
	ParamKey string
	Method   string
	Id       int
	Supplier string
	Status   int
	Page     int
	RowPage  int
	OrderBy  string
	Order    string

	KodeSupplier  string
	NamaSupplier  string
	NomorTelp     string
	Email         string
	NomorRekening string
	Alamat        string
}

type JSupplierResponse struct {
	Id            int
	KodeSupplier  string
	NamaSupplier  string
	NomorTelp     string
	Email         string
	NomorRekening string
	Alamat        string
	Status        int
}

func Supplier(c *gin.Context) {
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

	reqBody := JSupplierRequest{}
	jSupplierResponse := JSupplierResponse{}
	jSupplierResponses := []JSupplierResponse{}

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
	logFile = logFile + "Supplier_" + dateNow + ".log"
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
		dataLogSupplier(jSupplierResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}

	IsJson := helper.IsJson(bodyString)
	if !IsJson {
		errorMessage = "Error, Body - invalid json data"
		dataLogSupplier(jSupplierResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}
	// ------ end of body json validation ------

	// ------ Header Validation ------
	if helper.ValidateHeader(bodyString, c) {
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			errorMessage = "Error, Bind Json Data"
			dataLogSupplier(jSupplierResponses, reqBody.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
			return
		} else {
			username := reqBody.Username
			paramKey := reqBody.ParamKey
			method := reqBody.Method
			id := reqBody.Id
			kodeSupplier := reqBody.KodeSupplier
			namaSupplier := reqBody.NamaSupplier
			nomorTelp := reqBody.NomorTelp
			email := reqBody.Email
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
				dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
			// ------ end of Param Validation ------

			// ------ start check session paramkey ------
			checkAccessVal := helper.CheckSession(username, paramKey, c)
			if checkAccessVal != "1" {
				dataLogSupplier(jSupplierResponses, username, errorCodeSession, errorMessageSession, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}

			if method == "INSERT" {
				if namaSupplier == "" {
					errorMessage += "Nama Supplier tidak boleh kosong!"
				}
				if nomorRekening == "" {
					errorMessage += "Nama Rekening tidak boleh kosong!"
				}
				if alamat == "" {
					errorMessage += "alamat tidak boleh kosong!"
				}
				if nomorTelp == "" {
					errorMessage += "Nomor Telpon tidak boleh kosong!"
				}

				if errorMessage != "" {
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				kodeSupplier, _ := helper.GenerateRandomString(6)

				var cekSupplier int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_supplier WHERE supplier = '%s'", namaSupplier)
				err := db.QueryRow(queryCheck).Scan(&cekSupplier)
				if err != nil {
					errorMessage = err.Error()
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if cekSupplier > 0 {
					errorMessage = "Supplier sudah terdaftar"
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				// ------ Insert Query ------

				queryInsert := fmt.Sprintf("INSERT INTO db_supplier (kode_supplier, supplier, status, nomor_telp, nomor_rekening, alamat, email, tgl_input) values ('%s','%s','1','%s','%s','%s','%s', NOW())", kodeSupplier, namaSupplier, nomorTelp, nomorRekening, alamat, email)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogSupplier(jSupplierResponses, username, "0", "Insert berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else if method == "UPDATE" {
				if namaSupplier == "" {
					errorMessage += "Nama Supplier tidak boleh kosong!"
				}
				if nomorRekening == "" {
					errorMessage += "Nama Rekening tidak boleh kosong!"
				}
				if alamat == "" {
					errorMessage += "alamat tidak boleh kosong!"
				}
				if nomorTelp == "" {
					errorMessage += "Nomor Telpon tidak boleh kosong!"
				}

				if errorMessage != "" {
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				var cekSupplier int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_supplier WHERE supplier = '%s'", namaSupplier)
				err := db.QueryRow(queryCheck).Scan(&cekSupplier)
				if err != nil {
					errorMessage = err.Error()
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				if cekSupplier > 0 {
					errorMessage = "Supplier sudah terdaftar"
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryInsert := fmt.Sprintf("UPDATE db_supplier SET supplier = '%s', status = '%d', nomor_telp = '%s', nomor_rekening = '%s', alamat= '%s', email = '%s' WHERE id = '%d'", namaSupplier, status, nomorTelp, nomorRekening, alamat, email, id)
				_, errInsert := db.Exec(queryInsert)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryInsert, errInsert)
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				dataLogSupplier(jSupplierResponses, username, "0", "Update berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return

			} else if method == "DELETE" {
				var cekSupplier int
				queryCheck := fmt.Sprintf("SELECT COUNT(1)  FROM db_supplier WHERE id = '%d'", id)
				err := db.QueryRow(queryCheck).Scan(&cekSupplier)
				if err != nil {
					errorMessage = err.Error()
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				queryDelete := fmt.Sprintf("UPDATE db_supplier SET status = '0' WHERE id = '%d'", id)
				_, errInsert := db.Exec(queryDelete)
				if errInsert != nil {
					paramKey = ""
					errorMessage = fmt.Sprintf("Error running %q: %+v", queryDelete, errInsert)
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}

				dataLogSupplier(jSupplierResponses, username, "0", "Delete berhasil", totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
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

				if kodeSupplier != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" kode_supplier LIKE '%%%s%%' ", kodeSupplier)
				}

				if namaSupplier != "" {
					if queryWhere != "" {
						queryWhere += " AND "
					}

					queryWhere += fmt.Sprintf(" supplier LIKE '%%%s%%' ", namaSupplier)
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
				query := fmt.Sprintf("SELECT COUNT(1) AS cnt FROM db_supplier %s", queryWhere)
				if err := db.QueryRow(query).Scan(&totalRecords); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
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
				query1 := fmt.Sprintf("SELECT id, supplier, kode_supplier, ifnull(nomor_telp,''), ifnull(email,''), ifnull(nomor_rekening,'') ,ifnull(alamat,''), status FROM db_supplier %s %s", queryWhere, queryLimit)
				// fmt.Println(query1)
				rows, err := db.Query(query1)
				defer rows.Close()
				if err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				for rows.Next() {
					err = rows.Scan(
						&jSupplierResponse.Id,
						&jSupplierResponse.NamaSupplier,
						&jSupplierResponse.KodeSupplier,
						&jSupplierResponse.NomorTelp,
						&jSupplierResponse.Email,
						&jSupplierResponse.NomorRekening,
						&jSupplierResponse.Alamat,
						&jSupplierResponse.Status,
					)

					jSupplierResponses = append(jSupplierResponses, jSupplierResponse)

					if err != nil {
						errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
						dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}
				// ---------- end of query get menu ----------

				dataLogSupplier(jSupplierResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else {
				errorMessage = "Method undifined!"
				dataLogSupplier(jSupplierResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
		}
	}
}

func dataLogSupplier(jSupplierResponses []JSupplierResponse, username string, errorCode string, errorMessage string, totalRecords float64, totalPage float64, method string, path string, ip string, logData string, allHeader string, bodyJson string, c *gin.Context) {
	if errorCode != "0" {
		helper.SendLogError(username, "SUPPLIER", errorMessage, bodyJson, "", errorCode, allHeader, method, path, ip, c)
	}
	returnSupplier(jSupplierResponses, errorCode, errorMessage, logData, totalRecords, totalPage, c)
}

func returnSupplier(jSupplierResponses []JSupplierResponse, errorCode string, errorMessage string, logData string, totalRecords float64, totalPage float64, c *gin.Context) {

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
			"Result":       jSupplierResponses,
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
