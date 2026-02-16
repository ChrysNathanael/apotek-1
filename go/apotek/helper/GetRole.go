package helper

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func GetRole(username string, c *gin.Context) (string, string, string) {
	db := Connect(c)
	defer db.Close()

	roleId := ""
	query := fmt.Sprintf("SELECT role FROM db_login login, db_login_role role WHERE login.role_id = role.id AND username = '%s'", username)
	if err := db.QueryRow(query).Scan(&roleId); err != nil {
		errorMessage := fmt.Sprintf("Error running %q: %+v", query, err)
		return "1", errorMessage, ""
	}

	return "0", "", roleId
}
