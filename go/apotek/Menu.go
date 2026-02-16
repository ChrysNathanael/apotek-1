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

type JMenuRequest struct {
	Username string
	ParamKey string
	Method string
	Access string
	Page        int
	RowPage     int
	OrderBy     string
	Order       string
}

type JMenuResponse struct {
	Id string
	Menu string
	Pageactive string
	Item []JSubMenuResponse
}

type JSubMenuResponse struct {
	IdSubMenu string
	SubMenu string
	Href string
}

func Menu(c *gin.Context) {
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

	jMenuRequest := JMenuRequest{}
	jMenuResponse := JMenuResponse{}
	jMenuResponses := []JMenuResponse{}

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
		dataLogMenu(jMenuResponses, jMenuRequest.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}

	IsJson := helper.IsJson(bodyString)
	if !IsJson {
		errorMessage = "Error, Body - invalid json data"
		dataLogMenu(jMenuResponses, jMenuRequest.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
		return
	}
	// ------ end of body json validation ------

	// ------ Header Validation ------
	if helper.ValidateHeader(bodyString, c) {
		if err := c.ShouldBindJSON(&jMenuRequest); err != nil {
			errorMessage = "Error, Bind Json Data"
			dataLogMenu(jMenuResponses, jMenuRequest.Username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
			return
		} else {
			username := jMenuRequest.Username
			paramKey := jMenuRequest.ParamKey
			method := jMenuRequest.Method
			access := jMenuRequest.Access
			page := jMenuRequest.Page
			rowPage := jMenuRequest.RowPage

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
				dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
			// ------ end of Param Validation ------

			// ------ start check session paramkey ------
			checkAccessVal := helper.CheckSession(username, paramKey, c)
			if checkAccessVal != "1" {
				dataLogMenu(jMenuResponses, username, errorCodeSession, errorMessageSession, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}

			if method == "INSERT" {

			} else if method == "UPDATE" {

			} else if method == "DELETE" {

			} else if method == "SELECT" {
				pageNow := (page - 1) * rowPage
				pageNowString := strconv.Itoa(pageNow)
				queryLimit := ""

				queryWhere := ""
				if access != "" {
					
				}

				if queryWhere != "" {
					queryWhere = " WHERE " + queryWhere
				}

				totalRecords = 0
				totalPage = 0
				query := fmt.Sprintf("SELECT COUNT(1) AS cnt FROM db_menu %s", queryWhere)
				if err := db.QueryRow(query).Scan(&totalRecords); err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
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
				query1 := fmt.Sprintf("SELECT id, menu, page_active FROM db_menu %s %s", queryWhere, queryLimit)
				rows, err := db.Query(query1)
				defer rows.Close()
				if err != nil {
					errorMessage = "Error running, " + err.Error()
					dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
					return
				}
				for rows.Next() {
					err = rows.Scan(
						&jMenuResponse.Id,
						&jMenuResponse.Menu,
						&jMenuResponse.Pageactive,
					)

					jSubMenuResponse := JSubMenuResponse{}
					jSubMenuResponses := []JSubMenuResponse{}

					query2 := fmt.Sprintf("SELECT id, menu, href FROM db_sub_menu WHERE id_parent = '%s'", jMenuResponse.Id)
					rows, err := db.Query(query2)
					defer rows.Close()
					if err != nil {
						errorMessage = "Error running, " + err.Error()
						dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
					for rows.Next() {
						err = rows.Scan(
							&jSubMenuResponse.IdSubMenu,
							&jSubMenuResponse.SubMenu,
							&jSubMenuResponse.Href,
						)

						if err != nil {
							errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
							dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
							return
						}

						jSubMenuResponses = append(jSubMenuResponses, jSubMenuResponse)
					}
					jMenuResponse.Item = jSubMenuResponses

					jMenuResponses = append(jMenuResponses, jMenuResponse)

					if err != nil {
						errorMessage = fmt.Sprintf("Error running %q: %+v", query1, err)
						dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
						return
					}
				}
				// ---------- end of query get menu ----------

				dataLogMenu(jMenuResponses, username, "0", errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			} else {
				errorMessage = "Method undifined!"
				dataLogMenu(jMenuResponses, username, errorCode, errorMessage, totalRecords, totalPage, method, path, ip, logData, allHeader, bodyJson, c)
				return
			}
		}
	}
}

func dataLogMenu(jMenuResponses []JMenuResponse, username string, errorCode string, errorMessage string, totalRecords float64, totalPage float64, method string, path string, ip string, logData string, allHeader string, bodyJson string, c *gin.Context) {
	if errorCode != "0" {
		helper.SendLogError(username, "SUPPLIER", errorMessage, bodyJson, "", errorCode, allHeader, method, path, ip, c)
	}
	returnMenu(jMenuResponses, errorCode, errorMessage, logData, totalRecords, totalPage, c)
}

func returnMenu(jMenuResponses []JMenuResponse, errorCode string, errorMessage string, logData string, totalRecords float64, totalPage float64, c *gin.Context) {

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
			"Result": jMenuResponses, 
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
