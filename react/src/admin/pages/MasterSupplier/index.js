import React, { useEffect, useState, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Gap, HeaderPage, ModalAddNewSupplier, ModalDetailSupplier, ModalExport, ModalFilter, Pagination, SkeletonListData } from '../../components'
import { useDispatch } from 'react-redux';
import { setForm } from '../../redux';
import { useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import './master_supplier.css';
import { BtnExportData, BtnFilter, IcActive, IcAddNew, IcDelete, IcDetail, IcExport, IcFilter, IcInactive, icQuestionMark } from '../../assets';
import { generateSignature, fetchStatus, FormatNumberComma, validEmail } from '../../utils/functions';
import { AlertMessage, paths } from '../../utils';
import xlsx from 'xlsx';
import ModalFilterSupplier from '../../components/atoms/ModalFilterSupplier';

const MasterSupplier = () => {
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
    const [ShowModalDetail, setShowModalDetail] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);


    const [FilterBy, setFilterBy] = useState("")
    const [SearchFilter, setSearchFilter] = useState("")
    const [StartDate, setStartDate] = useState("")
    const [EndDate, setEndDate] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")

    const [ListMasterSupplier, setListMasterSupplier] = useState([])
    const [ListMasterSupplierDetail, setListMasterSupplierDetail] = useState([])

    const [CurrentPage, setCurrentPage] = useState(1)
    const [TotalPage, setTotalPage] = useState(0)
    const [TotalRecords, setTotalRecords] = useState(0)
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const timerRef = useRef(null);
    const [EmailForExport, setEmailForExport] = useState("")
    const [EmailFilled, setEmailFilled] = useState("")

    const [NamaSupplier, setNamaSupplier] = useState("")
    const [NomorRekening, SetNomorRekening] = useState("")
    const [NomorTelp, setNomorTelp] = useState("")
    const [Alamat, SetAlamat] = useState("")
    const [Email, SetEmail] = useState("")

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

        getListMasterSupplier(1)

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

    const getListMasterSupplier = (currentPage, position) => {
        var CookieParamKey = getCookie("paramkey")
        var CookieUserID = getCookie("userid")

        let filter = FilterBy
        let valueSearchSupplier = ""

        if (FilterBy === "supplier" && SearchFilter !== "") {
            valueSearchSupplier = SearchFilter
        }
        let statusFilter = ""
        if (position == "reset-filter") {
            valueSearchSupplier = ""
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
            "namaSupplier": valueSearchSupplier,
            "Status": statusFilter,
            "Order": "",
            "OrderBy": "",
            "Page": currentPage,
            "RowPage": rowPage
        })

            console.log("REQUEST BODY:", requestBody); // 👈 TAMBAHKAN INIa
    console.log("valueSearchSupplier:", valueSearchSupplier); // 👈 DAN INI

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Supplier'
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
                    setListMasterSupplier(data.Result)
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

       const getDetailSupplier = (id) => {
            let CookieParamKey = getCookie("paramkey")
            let CookieUserID = getCookie("userid")
    
            var requestBody = JSON.stringify({
                "Username": CookieUserID,
                "ParamKey": CookieParamKey,
                "Method": "SELECT",
                "Id": id,
                "Page": 1,
                "RowPage": 1
            })
    
            var enckey = paths.EncKey
            var url = paths.URL_API_ADMIN + 'Supplier'
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
                    setListMasterSupplierDetail(data.Result);
                    setShowModalDetail(true); // 👈 PENTING
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
        getListMasterSupplier(1, "reset-filter")
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
        getListMasterSupplier(1)
    }

    const handleButtonExport = () => {
        getListMasterSupplier(1, "export")  
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
        getListMasterSupplier(pageNumber)
        

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

        const handleValidasiDelete = (id, KodeSupplier, status) => {
    
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
                "KodeSupplier": KodeSupplier,
                "Status": statusUpdate
            })
    
            var enckey = paths.EncKey
            var url = paths.URL_API_ADMIN + 'Supplier'
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
                    getListMasterSupplier(1)
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
        setNamaSupplier("")
        setNomorTelp("")
        SetNomorRekening("")
        SetAlamat("")
        SetEmail("")
        setShowModalAddnew(false)
    }

    const handleButtonSubmitAddNew = () => {
        // hit API add new Supplier
        let CookieParamKey = getCookie("paramkey")
        let CookieUserID = getCookie("userid")

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "INSERT",
            "NamaSupplier": NamaSupplier,
            "NomorTelp": NomorTelp,
            "NomorRekening": NomorRekening,
            "Alamat": Alamat,
            "Email": Email
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Supplier'
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
                setNamaSupplier("")
                setNomorTelp("")
                SetNomorRekening("")
                SetAlamat("")
                SetEmail("")

                getListMasterSupplier(1)

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
                    NamaSupplier: row.NamaSupplier, 
                    NomorTelp: row.NomorTelp, 
                    NomorRekening: row.NomorRekening,  
                    StatusSupplier:row.Status == "1" ? "Aktif" : "Tidak Aktif",
                    Alamat:row.Alamat,
                    Email:row.Email
                }
            })
        }

       const exportToExcel = (csvData) => {
    
            var fileName = "export_master_supplier";
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

    const handleSubmitUpdateSupplier = (formData) => {
        let CookieParamKey = getCookie("paramkey")
        let CookieUserID = getCookie("userid")

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "Id": formData.Id,
            "NamaSupplier": formData.NamaSupplier,
            "NomorTelp": formData.NomorTelp,
            "NomorRekening": formData.NomorRekening,
            "Alamat": formData.Alamat,
            "Email": formData.Email  
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Supplier'
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
                setNamaSupplier("")
                setNomorTelp("")
                SetNomorRekening("")
                SetAlamat("")
                SetEmail("")

                getListMasterSupplier(1)

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

    fetch(paths.URL_API_ADMIN + 'Supplier', {
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
            setShowModalDetail(false)
            getListMasterSupplier(CurrentPage)
            setSuccessMessageTime("Update supplier berhasil")
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
                                <div className='card-content-text-sm-black2-title' style={{ fontWeight:'bold', fontSize:15 }}>Master Supplier</div>
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
                                        <td className='table-content-td-header' style={{ textAlign:'left' }}>Nama Supplier</td>
                                        <td className='table-content-td-header' style={{ textAlign:'left' }}>Kode Supplier</td>
                                        <td className='table-content-td-header' style={{ textAlign:'left' }}>Nomor Telepon</td>
                                        <td className='table-content-td-header' style={{ textAlign:'center' }}>Status</td>
                                    </tr>
                                    {ListMasterSupplier.map((item, index) => {
                                        return <tr className='table-content-tr'>
                                            <td className='table-content-td'>{index + 1}</td>
                                            <td className='table-content-td' style={{ color:'blue', cursor:'pointer', textAlign:'left' }} onClick={() => getDetailSupplier(item.Id)}>{item.NamaSupplier}</td>
                                            <td className='table-content-td' style={{ textAlign:'left' }}>{item.KodeSupplier}</td>
                                            <td className='table-content-td' style={{ textAlign:'left' }}>{item.NomorTelp}</td>
                                            <td className='table-content-td' style={{ textAlign:'center' }}>{item.Status == "1" ? 
                                                <div onClick={() => handleValidasiDelete(item.Id, item.KodeSupplier, "active")} style={{ cursor:'pointer' }}>
                                                    <img src={IcActive} style={{ width:18 }} />
                                                </div> 
                                                :
                                                <div onClick={() => handleValidasiDelete(item.Id, item.KodeSupplier, "inactive")} style={{ cursor:'pointer' }}>
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

                {ShowModalDetail && (
                <ModalDetailSupplier
                    onClickShowModal={ShowModalDetail}
                    onClickCancel={() => setShowModalDetail(false)}
                    data={ListMasterSupplierDetail?.[0]}
                    NamaSupplier={NamaSupplier}
                    setNamaSupplier={event => setNamaSupplier(event.target.value)}
                    NomorTelp={NomorTelp}
                    setNomorTelp={event => setNomorTelp(event.target.value)}
                    NomorRekening={NomorRekening}
                    SetNomorRekening={event => SetNomorRekening(event.target.value)}
                    Alamat={Alamat}
                    SetAlamat={event => SetAlamat(event.target.value)}
                    Email={Email}
                    SetEmail={event => SetEmail(event.target.value)}
                    SubmitUpdate={handleSubmitUpdateSupplier}
                />
                )}



                <ModalAddNewSupplier
                    onClickShowModal={ShowModalAddnew}
                    onClickCancel={() => handleCloseAddNew()}
                    NamaSupplier={NamaSupplier}
                    setNamaSupplier={event => setNamaSupplier(event.target.value)}
                    NomorTelp={NomorTelp}
                    setNomorTelp={event => setNomorTelp(event.target.value)}
                    NomorRekening={NomorRekening}
                    SetNomorRekening={event => SetNomorRekening(event.target.value)}
                    Alamat={Alamat}
                    SetAlamat={event => SetAlamat(event.target.value)}
                    Email={Email}
                    SetEmail={event => SetEmail(event.target.value)}
                    cancelAddNew={() => handleCloseAddNew()}
                    submitAddNew={() => handleButtonSubmitAddNew()}
                />

                <ModalFilterSupplier
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
                    showSupplier={true}
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

            {/* {DeleteMessageAlert != "" ?
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Ya, Hapus!"
                confirmBtnBsStyle="danger"
                cancelBtnText="Batal"
                title={DeleteMessageAlert}
                onConfirm={() => handleDelete()}
                onCancel={() => {
                    setShowAlert(false)
                    setDeleteMessageAlert("")
                }}
                focusCancelBtn>
            </SweetAlert>
            : ""} */}
        {/* END OF ALERT */}
        
            <Gap height={20} />
        </div>
    )
}


export default MasterSupplier