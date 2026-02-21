import React, { useEffect, useState, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Gap, HeaderPage, ModalAddNewKategori, ModalExport, ModalFilterKategori, Pagination, SkeletonListData } from '../../components'
import { useDispatch } from 'react-redux';
import { setForm } from '../../redux';
import { useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import './master_kategori.css';
import { BtnExportData, BtnFilter, IcActive, IcAddNew, IcDelete, IcDetail, IcExport, IcFilter, IcInactive, icQuestionMark } from '../../assets';
import { generateSignature, fetchStatus, FormatNumberComma, validEmail } from '../../utils/functions';
import { AlertMessage, paths } from '../../utils';
import xlsx from 'xlsx';

const MasterKategori = () => {
    const history = useHistory();
    const [OrderBy, setOrderBy] = useState("")
    const [Order, setOrder] = useState("DESC")
    const [Loading, setLoading] = useState(false)

    const location = useLocation();
    // location.state.postContent
    const dispatch = useDispatch();
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    const [PageActive, setPageActive] = useState(1)
    const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessage, setSuccessMessage] = useState("")
    const [SuccessMessageTime, setSuccessMessageTime] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")
    const [ErrorMessageAlertLogout, setErrorMessageAlertLogout] = useState("")
    const [DeleteMessageAlert, setDeleteMessageAlert] = useState("")

    const [UserID, setUserID] = useState("")
    const [Nama, setNama] = useState("")
    const [CurrentTime, setCurrentTime] = useState(new Date());
    const [Search, setSearch] = useState("")

    const totalItems = 1000;
    const itemsPerPage = 10;

    const [ShowModalFilter, setShowModalFilter] = useState(false)
    const [ShowModalExport, setShowModalExport] = useState(false)
    const [ShowModalAddnew, setShowModalAddnew] = useState(false)
    const [showDetail, setShowDetail] = useState(false);
    const [selectedSatuan, setSelectedSatuan] = useState(null);


    const [FilterBy, setFilterBy] = useState("")
    const [SearchFilter, setSearchFilter] = useState("")
    const [StartDate, setStartDate] = useState("")
    const [EndDate, setEndDate] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")

    const [ListMasterKategori, setListMasterKategori] = useState([])

    const [CurrentPage, setCurrentPage] = useState(1)
    const [TotalPage, setTotalPage] = useState(0)
    const [TotalRecords, setTotalRecords] = useState(0)
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const timerRef = useRef(null);
    const [EmailForExport, setEmailForExport] = useState("")
    const [EmailFilled, setEmailFilled] = useState("")
    
    const [Kategori, setKategori] = useState("")
    const [Deskripsi, setDeskripsi] = useState("")

    useEffect(() => {
        var CookieNama = getCookie("nama")
        var CookiePartnerCode = getCookie("partnercode")
        var CookieParamKey = getCookie("paramkey")
        var CookieUserID = getCookie("userid")

        if (CookieParamKey == null || CookieParamKey === ""
            || CookieUserID == null || CookieUserID === "") {
            logout()
            window.location.href = "/login";
            return false
        }

        let switchedCode = ""
        let switchedName = ""

        if (location.state && location.state.selectedPartner) {
            switchedCode = location.state.selectedPartner
            switchedName = location.state.selectedNama
        }
        else {
            switchedCode = CookiePartnerCode || "";
            switchedName = CookieNama || ""
        }

        if (Nama !== switchedName) {
            setNama(switchedName)
        }

        dispatch(setForm("ParamKey", CookieParamKey))
        dispatch(setForm("UserID", CookieUserID))
        dispatch(setForm("Nama", switchedName))
        dispatch(setForm("PageActive", "ACTIVE_USERS"))

        getListMasterKategori(1)

    }, [location.state]);

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie != "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserID = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var PartnerCode = LongSecretCookie[3];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)

            if (tipe == "userid") {
                return UserID;
            } else if (tipe == "paramkey") {
                return ParamKey;
            } else if (tipe == "nama") {
                return Nama;
            } else if (tipe == "partnercode") {
                return PartnerCode;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    const getFormattedDateTime = (date) => {
        // Get Time Components
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Determine AM or PM and convert to 12-hour format
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'

        // Pad time components with leading zeros
        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        // Get Date Components
        const day = date.getDate(); // Day of the month (1-31)
        const month = date.getMonth(); // Month (0-11, so January is 0)
        const year = date.getFullYear(); // Full year (e.g., 2024)
        const dayOfWeek = date.getDay(); // Day of the week (0 for Sunday, 6 for Saturday)

        // Optional: Array for full month names and day names
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const formattedMonth = monthNames[month];

        // Pad day with leading zero if needed (though not always standard for day of month)
        const formattedDay = day < 10 ? `0${day}` : day;

        // Combine all components
        return `${formattedDay} ${formattedMonth} ${year} | ${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const logout = () => {
        removeCookie('varCookie', { path: '/' });
        removeCookie('varMerchantId', { path: '/' });
        removeCookie('varIdVoucher', { path: '/' });
        dispatch(setForm("ParamKey", ''))
        dispatch(setForm("UserID", ''))
        dispatch(setForm("Nama", ''))
        dispatch(setForm("Role", ''))

        if (window) {
            sessionStorage.clear();
        }
    }

    const getListMasterKategori = (currentPage, position) => {
        var CookieParamKey = getCookie("paramkey")
        var CookieUserID = getCookie("userid")

        let filter = FilterBy
        let valueSearchSatuan = ""

        if (FilterBy === "kategori" && SearchFilter !== "") {
            valueSearchSatuan = SearchFilter
        }
        let statusFilter = ""
        if (position == "reset-filter") {
            valueSearchSatuan = ""
            statusFilter = ""
        } else {
            statusFilter = StatusFilter
        }

        let rowPage = 10
        if (position == "export") {
            rowPage = -1
        }

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "SELECT",
            "kategori": valueSearchSatuan,
            "Status": statusFilter,
            "Order": "",
            "OrderBy": "",
            "Page": currentPage,
            "RowPage": rowPage
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Kategori'
        var Signature = generateSignature(enckey, requestBody)

        setLoading(true)

        fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                'Content-Type': 'application/json',
                'Signature': Signature
            },
        })
        .then(fetchStatus)
        .then(response => response.json())
        .then((data) => {
            setLoading(false)

            if (data.ErrorCode == "0") {
                 if (position == "export") {
                    exportToExcel(data.Result)
                } else {
                    setListMasterKategori(data.Result)
                    setTotalRecords(data.TotalRecords)
                    setTotalPage(data.TotalPage)
                }
            } else {
                if (data.ErrorMessage == "Error, status response <> 200") {
                    setErrorMessageAlert("Data tidak ditemukan")
                    setShowAlert(true);
                    return false;
                } else if (data.ErrorMessage === "Session Expired") {
                    setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
                    return
                } else {
                    setErrorMessageAlert(data.ErrorMessage)
                    setShowAlert(true);
                    return false;
                }
            }
        })
        .catch((error) => {
            setLoading(false)

            if (error.message == 401) {
                setErrorMessageAlert("Sesi berakhir, silakan login ulang.");
                setShowAlert(true);
                return false;
            } else if (error.message != 401) {
                setErrorMessageAlert(AlertMessage.failedConnect);
                setShowAlert(true);
                return false;
            }
        });
    }

    //    const getDetailSatuan = (id) => {
    //         let CookieParamKey = getCookie("paramkey")
    //         let CookieUserID = getCookie("userid")
    
    //         var requestBody = JSON.stringify({
    //             "Username": CookieUserID,
    //             "ParamKey": CookieParamKey,
    //             "Method": "SELECT",
    //             "Id": id,
    //             "Page": 1,
    //             "RowPage": 1
    //         })
    
    //         var enckey = paths.EncKey
    //         var url = paths.URL_API_ADMIN + 'Kategori'
    //         var Signature = generateSignature(enckey, requestBody)
    
    //         setLoading(true)
    
    //         fetch(url, {
    //             method: "POST",
    //             body: requestBody,
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Signature': Signature
    //             },
    //         })
    //         .then(fetchStatus)
    //         .then(response => response.json())
    //         .then((data) => {
    //             setLoading(false)
    
    //             if (data.ErrorCode == "0") {
    //                 setListMasterKategoriDetail(data.Result);
    //                 setShowModalDetail(true); // 👈 PENTING
    //             } else {
    //                 if (data.ErrorMessage == "Error, status response <> 200") {
    //                     setErrorMessageAlert("Data tidak ditemukan")
    //                     setShowAlert(true);
    //                     return false;
    //                 } else if (data.ErrorMessage === "Session Expired") {
    //                     setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
    //                     setShowAlert(true);
    //                     return
    //                 } else {
    //                     setErrorMessageAlert(data.ErrorMessage)
    //                     setShowAlert(true);
    //                     return false;
    //                 }
    //             }
    //         })
    //         .catch((error) => {
    //             setLoading(false)
    //             if (error.message == 401) {
    //                 setErrorMessageAlert("Sesi berakhir, silakan login ulang.");
    //                 setShowAlert(true);
    //                 return false;
    //             } else if (error.message != 401) {
    //                 setErrorMessageAlert(AlertMessage.failedConnect);
    //                 setShowAlert(true);
    //                 return false;
    //             }
    //         });
    //     }

    const handleButtonFilter = () => {
        // setSearchFilter("")
        // setFilterBy("")
        setShowModalFilter(!ShowModalFilter)
    }

    const handleResetFilter = () => {
        setFilterBy("")
        setSearchFilter("")
        setStatusFilter("")
        setShowModalFilter(false)
        getListMasterKategori(1, "reset-filter")
    }

    const handleSubmitFilter = () => {
        if (FilterBy !== "") {
            if (SearchFilter == "") {
                setErrorMessageAlert("Kolom pencarian tidak boleh kosong.")
                setShowAlert(true);
                return
            }
        }
        setShowModalFilter(false)
        getListMasterKategori(1)
    }

    const handleButtonExport = () => {
        getListMasterKategori(1, "export")  
    }

    const handleSubmitExport = () => {
        if (validEmail(EmailForExport)) {
            setEmailForExport("")
            setLoading(true)
            setShowModalExport(false);
        } else {
            setErrorMessageAlert("Email tidak valid")
            setShowAlert(true);
            return
        }
    }

    const handleResetExport = () => {
        setErrorMessageAlert("Silahkan hubungi Developer untuk melakukan reset pada email business.")
        setShowAlert(true)
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > TotalPage) {
            return;
        }
        setCurrentPage(pageNumber);
        getListMasterKategori(pageNumber)
        

    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const pageRangeDisplayed = 3;
        const maxPagesToShow = pageRangeDisplayed * 2 + 1;

        if (TotalPage <= maxPagesToShow) {
            for (let i = 1; i <= TotalPage; i++) {
                pageNumbers.push(i);
            }
        } else {
            const startPage = Math.max(1, CurrentPage - pageRangeDisplayed);
            const endPage = Math.min(TotalPage, CurrentPage + pageRangeDisplayed);

            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) {
                    pageNumbers.push('...');
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < TotalPage) {
                if (endPage < TotalPage - 1) {
                    pageNumbers.push('...');
                }
                pageNumbers.push(TotalPage);
            }
        }
        return pageNumbers;
    };

    const displayedPageNumbers = getPageNumbers();

    const datakosong = (strip) => {
        if (strip == "") {
            return "-"
        }
        return strip
    }

        const handleValidasiDelete = (id, kategori, status) => {
    
            let CookieParamKey = getCookie("paramkey")
            let CookieUserID = getCookie("userid")
    
            let statusUpdate = ""
            if (status == "active") {
                statusUpdate = "0"
            } else {
                statusUpdate = "1"
            }
    
            var requestBody = JSON.stringify({
                "Username": CookieUserID,
                "ParamKey": CookieParamKey,
                "Method": "DELETE",
                "Id": id,
                "kat": kategori,
                "Status": statusUpdate
            })
    
            var enckey = paths.EncKey
            var url = paths.URL_API_ADMIN + 'Kategori'
            var Signature = generateSignature(enckey, requestBody)
    
            setLoading(true)
    
            fetch(url, {
                method: "POST",
                body: requestBody,
                headers: {
                    'Content-Type': 'application/json',
                    'Signature': Signature
                },
            })
            .then(fetchStatus)
            .then(response => response.json())
            .then((data) => {
                setLoading(false)
    
                if (data.ErrorCode == "0") {
                    getListMasterKategori(1)
                    // setShowAlert(false)
                    // setDeleteMessageAlert("")
                    setShowAlert(true)
                    setSuccessMessageTime("Sukses update status")
                } else {
                    if (data.ErrorMessage == "Error, status response <> 200") {
                        setErrorMessageAlert("Data tidak ditemukan")
                        setShowAlert(true);
                        return false;
                    } else if (data.ErrorMessage === "Session Expired") {
                        setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                        setShowAlert(true);
                        return
                    } else {
                        setErrorMessageAlert(data.ErrorMessage)
                        setShowAlert(true);
                        return false;
                    }
                }
            })
            .catch((error) => {
                setLoading(false)
                if (error.message == 401) {
                    setErrorMessageAlert("Sesi berakhir, silakan login ulang.");
                    setShowAlert(true);
                    return false;
                } else if (error.message != 401) {
                    setErrorMessageAlert(AlertMessage.failedConnect);
                    setShowAlert(true);
                    return false;
                }
            });
        }

    const handleButtonAddNew = () => {
        setShowModalAddnew(true)
    }

    const handleCloseAddNew = () => {
        setKategori("")
        setDeskripsi("")
        setShowModalAddnew(false)
    }

    const handleButtonSubmitAddNew = () => {
        // hit API add new Kategori
        let CookieParamKey = getCookie("paramkey")
        let CookieUserID = getCookie("userid")

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "INSERT",
            "Kategori": Kategori,
            "Deskripsi": Deskripsi
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Kategori'
        var Signature = generateSignature(enckey, requestBody)

        setLoading(true)

        fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                'Content-Type': 'application/json',
                'Signature': Signature
            },
        })
        .then(fetchStatus)
        .then(response => response.json())
        .then((data) => {
            setLoading(false)

            if (data.ErrorCode == "0") {
                setShowModalAddnew(false)
                setShowAlert(true)
                
                //reset form
                setKategori("")
                setDeskripsi("")

                getListMasterKategori(1)

                setSuccessMessageTime("Sukses insert data")
            } else {
                if (data.ErrorMessage == "Error, status response <> 200") {
                    setErrorMessageAlert("Data tidak ditemukan")
                    setShowAlert(true);
                    return false;
                } else if (data.ErrorMessage === "Session Expired") {
                    setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
                    return
                } else {
                    setErrorMessageAlert(data.ErrorMessage)
                    setShowAlert(true);
                    return false;
                }
            }
        })
        .catch((error) => {
            setLoading(false)
            if (error.message == 401) {
                setErrorMessageAlert("Sesi berakhir, silakan login ulang.");
                setShowAlert(true);
                return false;
            } else if (error.message != 401) {
                setErrorMessageAlert(AlertMessage.failedConnect);
                setShowAlert(true);
                return false;
            }
        });
    }
    
        const renameAtributForClient = (csvData) => {
            return csvData.map(function (row) {
                return {
                    Kategori: row.Kategori,  
                    StatusSatuan:row.Status == "1" ? "Aktif" : "Tidak Aktif",
                }
            })
        }

       const exportToExcel = (csvData) => {
    
            var fileName = "export_master_satuan";
            var DataExcel = csvData;
    
            var ws = "";
                ws = xlsx.utils.json_to_sheet(removeAtribut(renameAtributForClient(DataExcel)));
    
            const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    
            xlsx.writeFile(wb, fileName + ".xlsx")
        }
        
           const removeAtribut = (data) => {
        data.forEach(dt => {
            delete dt.ParamKey;
            delete dt.UserID;
            delete dt.Method;
            delete dt.Page;
            delete dt.RowPage;
            delete dt.OrderBy;
            delete dt.Order;
        });
        return data;
    }

    const handleSubmitUpdateSatuan = (formData) => {
        let CookieParamKey = getCookie("paramkey")
        let CookieUserID = getCookie("userid")

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "Id": formData.Id,
            "Kategori": formData.Kategori,
            "Deskripsi": formData.Deskripsi,
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Kategori'
        var Signature = generateSignature(enckey, requestBody)

        setLoading(true)

        fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                'Content-Type': 'application/json',
                'Signature': Signature
            },
        })
        .then(fetchStatus)
        .then(response => response.json())
        .then((data) => {
            setLoading(false)

            if (data.ErrorCode == "0") {
                setShowModalAddnew(false)
                setShowAlert(true)             
                //reset form
                setKategori("")
                getListMasterKategori(1)

                setSuccessMessageTime("Sukses insert data")
            } else {
                if (data.ErrorMessage == "Error, status response <> 200") {
                    setErrorMessageAlert("Data tidak ditemukan")
                    setShowAlert(true);
                    return false;
                } else if (data.ErrorMessage === "Session Expired") {
                    setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
                    setShowAlert(true);
                    return
                } else {
                    setErrorMessageAlert(data.ErrorMessage)
                    setShowAlert(true);
                    return false;
                }
            }
        })
        .catch((error) => {
            setLoading(false)
            if (error.message == 401) {
                setErrorMessageAlert("Sesi berakhir, silakan login ulang.");
                setShowAlert(true);
                return false;
            } else if (error.message != 401) {
                setErrorMessageAlert(AlertMessage.failedConnect);
                setShowAlert(true);
                return false;
            }
        });

    

    setLoading(true)

    fetch(paths.URL_API_ADMIN + 'Kategori', {
        method: "POST",
        body: requestBody,
        headers: {
            'Content-Type': 'application/json',
            'Signature': Signature
        }
    })
    .then(fetchStatus)
    .then(res => res.json())
    .then(data => {
        setLoading(false)
        if (data.ErrorCode === "0") {
            // setShowModalDetail(false)
            getListMasterKategori(CurrentPage)
            setSuccessMessageTime("Update kategori berhasil")
        } else {
            setErrorMessageAlert(data.ErrorMessage)
            setShowAlert(true)
        }
    })
    .catch(() => {
        setLoading(false)
        setErrorMessageAlert("Gagal update data")
        setShowAlert(true)
    })
}


    return (
        <div className='main-page'>
            <div style={{ width: '100%' }}>
                <HeaderPage
                    nama={Nama}
                    // list={ListPartner}
                    // partnerCode={SessionPartnerCode}
                    setNama={setNama}
                    currentTime={getFormattedDateTime(CurrentTime)}
                    search={Search}
                    setSearch={event => setSearch(event.target.value)}
                />

                <div className='container-content-table'>
                    <div className='container-table'>
                        <div className='container-content-table-header'>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <div className='card-content-text-sm-black2-title' style={{ fontWeight:'bold', fontSize:15 }}>Master Kategori</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <div>
                                    <img src={IcAddNew} style={{ cursor: 'pointer', width:27 }} onClick={() => handleButtonAddNew()} />
                                </div>
                                <Gap width={15} />
                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding:8, backgroundColor:'orange', borderRadius:10 }}>
                                    <img src={IcFilter} style={{ cursor: 'pointer', width:20 }} onClick={() => handleButtonFilter()} />
                                    <Gap width={20} />
                                    <img src={IcExport} style={{ cursor: 'pointer', width:26 }} onClick={() => handleButtonExport()} />
                                </div>
                            </div>
                        </div>

                        

                        {Loading ?
                            <div className="loader-container">
                                <div className="spinner-border purple-spinner" />
                            </div>
                            :
                            <div>
                                <table className='table-content'>
                                    <tr className='table-content-tr'>
                                        <td className='table-content-td-header'>No</td>
                                        <td className='table-content-td-header' style={{ textAlign:'left' }}>Nama Kategori</td>
                                        <td className='table-content-td-header' style={{ textAlign:'center' }}>Deskripsi</td>
                                        <td className='table-content-td-header' style={{ textAlign:'center' }}>Status</td>
                                    </tr>
                                    {ListMasterKategori.map((item, index) => {
                                        return <tr className='table-content-tr'>
                                            <td className='table-content-td'>{index + 1}</td>
                                            <td className='table-content-td' style={{ textAlign:'left' }}>{item.Kategori}</td>
                                            <td className='table-content-td' style={{ textAlign:'center' }}>{item.Deskripsi}</td>
                                            <td className='table-content-td' style={{ textAlign:'center' }}>{item.Status == "1" ? 
                                                <div onClick={() => handleValidasiDelete(item.Id, item.Kategori, "active")} style={{ cursor:'pointer' }}>
                                                    <img src={IcActive} style={{ width:18 }} />
                                                </div> 
                                                :
                                                <div onClick={() => handleValidasiDelete(item.Id, item.Kategori, "inactive")} style={{ cursor:'pointer' }}>
                                                    <img src={IcInactive} style={{ width:18 }} />
                                                </div>}
                                            </td>
                                        </tr>
                                    })}
                                </table>
                            </div>}

                            {Loading < 1 || !Loading && 
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ paddingTop:15, color:'red', fontSize:15, fontWeight:'bold' }}>Data Tidak Ditemukan</div>
                        </div>}

                        {Loading ?
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <SkeletonListData width={200} height={30} />
                            </div>
                            : <div style={{
                                paddingTop: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}> Total Data : {TotalRecords}
                            </div>}

                    </div>
                </div>


                <ModalAddNewKategori
                    onClickShowModal={ShowModalAddnew}
                    onClickCancel={() => handleCloseAddNew()}
                    Kategori={Kategori}
                    setKategori={event => setKategori(event.target.value)}
                    Deskripsi={Deskripsi}
                    setDeskripsi={event => setDeskripsi(event.target.value)}
                    cancelAddNew={() => handleCloseAddNew()}
                    submitAddNew={() => handleButtonSubmitAddNew()}
                />

                <ModalFilterKategori
                    onClickShowModal={ShowModalFilter}
                    onClickCancel={() => handleButtonFilter()}
                    filterBy={FilterBy}
                    setFilterBy={event => setFilterBy(event.target.value)}
                    searchFilter={SearchFilter}
                    setSearchFilter={event => setSearchFilter(event.target.value)}
                    startDate={StartDate}
                    setStartDate={event => setStartDate(event.target.value)}
                    endDate={EndDate}
                    setEndDate={event => setEndDate(event.target.value)}
                    resetFilter={() => handleResetFilter()}
                    submitFilter={() => handleSubmitFilter()}
                    showDateFilter={false}
                    showStatusFilter={true}
                    showSearchFilter={true}
                    showKategori={true}
                    showName={true}
                    setStatusFilter={event => setStatusFilter(event.target.value)}
                    statusFilter={StatusFilter}
                />

                <ModalExport
                    onClickShowModal={ShowModalExport}
                    onClickCancel={() => {
                        setShowModalExport(false)
                        setEmailForExport("")
                    }}
                    onClickSubmit={() => handleSubmitExport()}
                    startDate={StartDate}
                    setStartDate={event => setStartDate(event.target.value)}
                    endDate={EndDate}
                    setEndDate={event => setEndDate(event.target.value)}
                    submitExport={handleSubmitExport}
                    resetFilter={() => handleResetExport()}
                    emailForExport={EmailForExport}
                    setemailForExport={setEmailForExport}
                    tempMail={EmailFilled}
                />

                {TotalRecords > 0 && 
                <Pagination
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    initialPage={1}
                    currentPage={CurrentPage}
                    handlePageChange={handlePageChange}
                    displayedPageNumbers={displayedPageNumbers}
                    totalPages={TotalPage}
                />}
            </div>

            {/* ALERT */}
            {SessionMessage != "" ?
                <SweetAlert
                    warning
                    show={ShowAlert}
                    onConfirm={() => {
                        setShowAlert(false)
                        logout()
                        window.location.href = "/login";
                    }}
                    btnSize="sm">
                    {SessionMessage}
                </SweetAlert>
                : ""}

            {SuccessMessage != "" ?
                <SweetAlert
                    success
                    show={ShowAlert}
                    onConfirm={() => {
                        setShowAlert(false)
                        setSuccessMessage("")
                        history.replace("/active-users")
                    }}
                    btnSize="sm">
                    {SuccessMessage}
                </SweetAlert>
                : ""}

            {SuccessMessageTime != "" ?
            <SweetAlert
                success
                show={ShowAlert}
                timeout={1500}
                showConfirm={false}
                onConfirm={() => {
                    setShowAlert(false)
                    setSuccessMessageTime("")
                }}
                btnSize="sm">
                {SuccessMessageTime}
            </SweetAlert>
            : ""}

            {ErrorMessageAlert != "" ?
                <SweetAlert
                    danger
                    show={ShowAlert}
                    onConfirm={() => {
                        setShowAlert(false)
                        setErrorMessageAlert("")
                    }}
                    btnSize="sm">
                    {ErrorMessageAlert}
                </SweetAlert>
                : ""}

            {ErrorMessageAlertLogout != "" ?
                <SweetAlert
                    danger
                    show={ShowAlert}
                    onConfirm={() => {
                        setShowAlert(false)
                        setErrorMessageAlertLogout("")
                        window.location.href = "/login";
                    }}
                    btnSize="sm">
                    {ErrorMessageAlertLogout}
                </SweetAlert>
                : ""}

        
            <Gap height={20} />
        </div>
    )
}


export default MasterKategori