import React, { useEffect, useState, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Gap, HeaderPage, ModalAddNewVendor, ModalDetailVendor, ModalExport, ModalFilterVendor, Pagination, SkeletonListData } from '../../components'
import { useDispatch } from 'react-redux';
import { setForm } from '../../redux';
import { useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import './master_vendor.css';
import { IcActive, IcAddNew, IcExport, IcFilter, IcInactive } from '../../assets';
import { generateSignature, fetchStatus, validEmail } from '../../utils/functions';
import { AlertMessage, paths } from '../../utils';
import xlsx from 'xlsx';

const MasterVendor = () => {
    const history = useHistory();
    const [Loading, setLoading] = useState(false)
    const location = useLocation();
    const dispatch = useDispatch();
    const [cookies, removeCookie] = useCookies(['user']);

    const [ShowAlert, setShowAlert] = useState(true)
    const [SessionMessage, setSessionMessage] = useState("")
    const [SuccessMessageTime, setSuccessMessageTime] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")

    const [Nama, setNama] = useState("")
    const [CurrentTime, setCurrentTime] = useState(new Date());
    const [Search, setSearch] = useState("")

    const totalItems = 1000;
    const itemsPerPage = 10;

    const [ShowModalFilter, setShowModalFilter] = useState(false)
    const [ShowModalExport, setShowModalExport] = useState(false)
    const [ShowModalAddnew, setShowModalAddnew] = useState(false)
    const [ShowModalDetail, setShowModalDetail] = useState(false);

    const [FilterBy, setFilterBy] = useState("")
    const [SearchFilter, setSearchFilter] = useState("")
    const [StatusFilter, setStatusFilter] = useState("")

    const [ListMasterVendor, setListMasterVendor] = useState([])
    const [ListMasterVendorDetail, setListMasterVendorDetail] = useState([])

    const [CurrentPage, setCurrentPage] = useState(1)
    const [TotalPage, setTotalPage] = useState(0)
    const [TotalRecords, setTotalRecords] = useState(0)
    const [EmailForExport, setEmailForExport] = useState("")

    const [NamaVendor, setNamaVendor] = useState("")
    const [NomorRekening, SetNomorRekening] = useState("")
    const [NomorTelepon, setNomorTelepon] = useState("")
    const [Alamat, SetAlamat] = useState("")

    useEffect(() => {
        var CookieNama = getCookie("nama")
        var CookieParamKey = getCookie("paramkey")
        var CookieUserID = getCookie("userid")

        if (CookieParamKey == null || CookieParamKey === "" || CookieUserID == null || CookieUserID === "") {
            logout()
            window.location.href = "/login";
            return false
        }

        let switchedName = CookieNama || ""

        if (Nama !== switchedName) {
            setNama(switchedName)
        }

        dispatch(setForm("ParamKey", CookieParamKey))
        dispatch(setForm("UserID", CookieUserID))
        dispatch(setForm("Nama", switchedName))

        getListMasterVendor(1)

    }, [location.state]);

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie != "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserID = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var Nama = LongSecretCookie[2];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)

            if (tipe == "userid") {
                return UserID;
            } else if (tipe == "paramkey") {
                return ParamKey;
            } else if (tipe == "nama") {
                return Nama;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    const getFormattedDateTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const formattedMonth = monthNames[month];
        const formattedDay = day < 10 ? `0${day}` : day;

        return `${formattedDay} ${formattedMonth} ${year} | ${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const logout = () => {
        removeCookie('varCookie', { path: '/' });
        dispatch(setForm("ParamKey", ''))
        dispatch(setForm("UserID", ''))
        dispatch(setForm("Nama", ''))

        if (window) {
            sessionStorage.clear();
        }
    }

    const getListMasterVendor = (currentPage, position) => {
        var CookieParamKey = getCookie("paramkey")
        var CookieUserID = getCookie("userid")

        let valueSearchVendor = ""

        if (FilterBy === "nama_vendor" && SearchFilter !== "") {
            valueSearchVendor = SearchFilter
        }

        let valueSearchTelepon = ""
        if (FilterBy === "nomor_telp" && SearchFilter !== "") {
            valueSearchTelepon = SearchFilter
        }
        
        let statusFilter = ""
        if (position == "reset-filter") {
            valueSearchVendor = ""
            valueSearchTelepon = ""
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
            "NamaVendor": valueSearchVendor,
            "NomorTelepon": valueSearchTelepon,
            "Status": statusFilter,  
            "Page": currentPage,
            "RowPage": rowPage
        })

        console.log("FilterBy:", FilterBy);
        console.log("Request Body:", requestBody);

        // ✅ TAMBAHKAN DARI SINI KE BAWAH ✅
        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Vendor'
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
        .then((data) => {  // 👈 INI ADALAH ".then" YANG ANDA MAKSUD
            setLoading(false)

            console.log("RESPONSE DATA:", data);  // 👈 TAMBAHKAN LOG INI UNTUK DEBUG

            if (data.ErrorCode == "0") {
                console.log("RESULT:", data.Result);  // 👈 DAN INI
                console.log("TOTAL RECORDS:", data.TotalRecords);  // 👈 DAN INI
                
                if (position == "export") {
                    exportToExcel(data.Result)
                } else {
                    setListMasterVendor(data.Result)
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
        // ✅ SAMPAI SINI ✅
    }

    const getDetailVendor = (id) => {
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
        var url = paths.URL_API_ADMIN + 'Vendor'
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
                setListMasterVendorDetail(data.Result);
                setShowModalDetail(true);
            } else {
                if (data.ErrorMessage === "Session Expired") {
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
            setErrorMessageAlert(AlertMessage.failedConnect);
            setShowAlert(true);
        });
    }

    const handleButtonFilter = () => {
        setShowModalFilter(!ShowModalFilter)
    }

    const handleResetFilter = () => {
        setFilterBy("")
        setSearchFilter("")
        setStatusFilter("")
        setShowModalFilter(false)
        getListMasterVendor(1, "reset-filter")
    }

    const handleSubmitFilter = () => {
        setShowModalFilter(false)
        getListMasterVendor(1)
    }

    const handleButtonExport = () => {
        getListMasterVendor(1, "export")  
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > TotalPage) {
            return;
        }
        setCurrentPage(pageNumber);
        getListMasterVendor(pageNumber)
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

    const handleValidasiDelete = (id, KodeVendor, status) => {
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
            "KodeVendor": KodeVendor,
            "Status": statusUpdate
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Vendor'
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
                getListMasterVendor(1)
                setShowAlert(true)
                setSuccessMessageTime("Sukses update status")
            } else {
                setErrorMessageAlert(data.ErrorMessage)
                setShowAlert(true);
            }
        })
        .catch((error) => {
            setLoading(false)
            setErrorMessageAlert(AlertMessage.failedConnect);
            setShowAlert(true);
        });
    }

    const handleButtonAddNew = () => {
        setShowModalAddnew(true)
    }

    const handleCloseAddNew = () => {
        setNamaVendor("")
        setNomorTelepon("")
        SetNomorRekening("")
        SetAlamat("")
        setShowModalAddnew(false)
    }

    const handleButtonSubmitAddNew = () => {
        let CookieParamKey = getCookie("paramkey")
        let CookieUserID = getCookie("userid")

        if (!NamaVendor || !NomorTelepon || !NomorRekening || !Alamat) {
            setErrorMessageAlert("Semua field harus diisi!")
            setShowAlert(true);
            return
        }

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "INSERT",
            "NamaVendor": NamaVendor,
            "NomorTelepon": NomorTelepon,
            "NomorRekening": NomorRekening,
            "Alamat": Alamat
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Vendor'
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
                setNamaVendor("")
                setNomorTelepon("")
                SetNomorRekening("")
                SetAlamat("")

                getListMasterVendor(1)

                setSuccessMessageTime("Sukses insert data")
            } else {
                setErrorMessageAlert(data.ErrorMessage)
                setShowAlert(true);
            }
        })
        .catch((error) => {
            setLoading(false)
            setErrorMessageAlert(AlertMessage.failedConnect);
            setShowAlert(true);
        });
    }
    
    const renameAtributForClient = (csvData) => {
        return csvData.map(function (row) {
            return {
                NamaVendor: row.NamaVendor, 
                KodeVendor: row.KodeVendor,
                NomorTelepon: row.NomorTelepon, 
                NomorRekening: row.NomorRekening,  
                Alamat: row.Alamat,
                StatusVendor: row.Status == 1 ? "Aktif" : "Tidak Aktif"
            }
        })
    }

    const exportToExcel = (csvData) => {
        var fileName = "export_master_vendor";
        var DataExcel = csvData;

        var ws = xlsx.utils.json_to_sheet(renameAtributForClient(DataExcel));
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        xlsx.writeFile(wb, fileName + ".xlsx")
    }

    const handleSubmitUpdateVendor = (formData) => {
        let CookieParamKey = getCookie("paramkey")
        let CookieUserID = getCookie("userid")

        var requestBody = JSON.stringify({
            "Username": CookieUserID,
            "ParamKey": CookieParamKey,
            "Method": "UPDATE",
            "Id": formData.Id,
            "NamaVendor": formData.NamaVendor,
            "NomorTelepon": formData.NomorTelepon,
            "NomorRekening": formData.NomorRekening,
            "Alamat": formData.Alamat
        })

        var enckey = paths.EncKey
        var url = paths.URL_API_ADMIN + 'Vendor'
        var Signature = generateSignature(enckey, requestBody)

        setLoading(true)

        fetch(url, {
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
                getListMasterVendor(CurrentPage)
                setSuccessMessageTime("Update vendor berhasil")
                setShowAlert(true)
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
                    setNama={setNama}
                    currentTime={getFormattedDateTime(CurrentTime)}
                    search={Search}
                    setSearch={event => setSearch(event.target.value)}
                />

                <div className='container-content-table'>
                    <div className='container-table'>
                        <div className='container-content-table-header'>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <div className='card-content-text-sm-black2-title' style={{ fontWeight:'bold', fontSize:15 }}>Master Vendor</div>
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
                                    <thead>
                                        <tr className='table-content-tr'>
                                            <td className='table-content-td-header'>No</td>
                                            <td className='table-content-td-header' style={{ textAlign:'left' }}>Nama Vendor</td>
                                            <td className='table-content-td-header' style={{ textAlign:'left' }}>Kode Vendor</td>
                                            <td className='table-content-td-header' style={{ textAlign:'left' }}>Nomor Telepon</td>
                                            <td className='table-content-td-header' style={{ textAlign:'center' }}>Status</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {ListMasterVendor.map((item, index) => {
                                        return <tr className='table-content-tr' key={index}>
                                            <td className='table-content-td'>{index + 1}</td>
                                            <td className='table-content-td' style={{ color:'blue', cursor:'pointer', textAlign:'left' }} onClick={() => getDetailVendor(item.Id)}>{item.NamaVendor}</td>
                                            <td className='table-content-td' style={{ textAlign:'left' }}>{item.KodeVendor}</td>
                                            <td className='table-content-td' style={{ textAlign:'left' }}>{item.NomorTelepon}</td>
                                            <td className='table-content-td' style={{ textAlign:'center' }}>{item.Status == 1 ? 
                                                <div onClick={() => handleValidasiDelete(item.Id, item.KodeVendor, "active")} style={{ cursor:'pointer' }}>
                                                    <img src={IcActive} style={{ width:18 }} />
                                                </div> 
                                                :
                                                <div onClick={() => handleValidasiDelete(item.Id, item.KodeVendor, "inactive")} style={{ cursor:'pointer' }}>
                                                    <img src={IcInactive} style={{ width:18 }} />
                                                </div>}
                                            </td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                            </div>}

                            {ListMasterVendor.length < 1 && !Loading && 
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
                <ModalDetailVendor
                    onClickShowModal={ShowModalDetail}
                    onClickCancel={() => setShowModalDetail(false)}
                    data={ListMasterVendorDetail?.[0]}
                    SubmitUpdate={handleSubmitUpdateVendor}
                />
                )}

                <ModalAddNewVendor
                    onClickShowModal={ShowModalAddnew}
                    onClickCancel={() => handleCloseAddNew()}
                    NamaVendor={NamaVendor}
                    setNamaVendor={event => setNamaVendor(event.target.value)}
                    NomorTelepon={NomorTelepon}
                    setNomorTelepon={event => setNomorTelepon(event.target.value)}
                    NomorRekening={NomorRekening}
                    SetNomorRekening={event => SetNomorRekening(event.target.value)}
                    Alamat={Alamat}
                    SetAlamat={event => SetAlamat(event.target.value)}
                    cancelAddNew={() => handleCloseAddNew()}
                    submitAddNew={() => handleButtonSubmitAddNew()}
                />

                <ModalFilterVendor
                    onClickShowModal={ShowModalFilter}
                    onClickCancel={() => handleButtonFilter()}
                    filterBy={FilterBy}
                    setFilterBy={event => setFilterBy(event.target.value)}
                    searchFilter={SearchFilter}
                    setSearchFilter={event => setSearchFilter(event.target.value)}
                    resetFilter={() => handleResetFilter()}
                    submitFilter={() => handleSubmitFilter()}
                    showDateFilter={false}
                    showStatusFilter={true}
                    showSearchFilter={true}
                    showVendor={true}
                    showName={true}
                    setStatusFilter={event => setStatusFilter(event.target.value)}
                    statusFilter={StatusFilter}
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
            {SessionMessage != "" &&
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
            }

            {SuccessMessageTime != "" &&
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
            }

            {ErrorMessageAlert != "" &&
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
            }
        
            <Gap height={20} />
        </div>
    )
}

export default MasterVendor