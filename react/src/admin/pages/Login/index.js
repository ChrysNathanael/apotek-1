import React, { Component, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Gap, Input } from '../../components';
import './login_bu.css'
import md5 from 'md5';
import { useSelector, useDispatch } from 'react-redux';
import { setForm } from '../../redux';
import { AlertMessage, paths } from '../../utils'
import { useCookies } from 'react-cookie';
import { fetchStatus2, fetchStatus, historyConfig, validEmail, generateSignature } from '../../utils/functions';
import { favicon, IcApotek, IcApotek2, IcApotek3, IcApotek4, IcApotek5, IcApotek6, IcApotek7, IcApotek8, IcLoginAstronot, IcLoginBulan, IcLoginMatahari, IcLoginPiringTerbang, IcLoginRoket, IcLoginRoketDiskon, IcLoginSatelit } from '../../assets';
import { Markup } from 'interweave';
import SweetAlert from 'react-bootstrap-sweetalert';
import { SHA256 } from 'crypto-js';

const Login = () => {
    const history = useHistory(historyConfig);
    const [Username, setUsername] = useState("")
    const [Password, setPassword] = useState("")
    const [Loading, setLoading] = useState(false)
    const axios = require('axios');
    const { form } = useSelector(state => state.LoginReducer);
    const dispatch = useDispatch();
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    const [ShowAlert, setShowAlert] = useState(true);
    const [ValidationMessage, setValidationMessage] = useState("")
    const [ErrorMessageAlert, setErrorMessageAlert] = useState("")

    useEffect(() => {

        var CookieParamKey = getCookie("paramkey");
        var CookieUserID = getCookie("userid");

        if ((CookieParamKey == null && CookieParamKey == null) && (CookieUserID == null && CookieUserID == null)) {
            logout()
            history.push('/login');
            return
        } else {
            setUsername(CookieUserID)
            setPassword(cookies.CookiePass)
            history.push('/dashboard');
            return
        }
    }, [])

    const logout = () => {
        setCookie('varCookie', "", { path: '/' })
        removeCookie('varCookie', { path: '/' });
        removeCookie('varMerchantId', { path: '/' });
        removeCookie('varIdVoucher', { path: '/' });
        dispatch(setForm("ParamKey", ''))
        dispatch(setForm("UserID", ''))
        if (window) {
            sessionStorage.clear();
        }
    }

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie != "" && SecretCookie != null && typeof SecretCookie == "string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserID = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)

            if (tipe == "userid") {
                return UserID;
            } else if (tipe == "paramkey") {
                return ParamKey;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    const handleLogin = (usernameValue, passwordValue) => {

        let validasiMessage = "";
        if (usernameValue == "") {
            validasiMessage += "- Silahkan isi Username terlebih dahulu.\n";
        }

        if (passwordValue == "") {
            validasiMessage += "- Silahkan isi Password terlebih dahulu.\n";
        }

        if (validasiMessage != "") {
            setValidationMessage(validasiMessage);
            setShowAlert(true);
            return false;
        } else {

            var requestBody = JSON.stringify({
                "Username": usernameValue,
                "Password": md5(passwordValue)
            });

            var enckey = paths.EncKey;
            // var url = 'http://10.186.117.200:1001/api/v1/Login';
            var url = paths.URL_API_ADMIN + 'Login'
            var Signature = generateSignature(enckey, requestBody)

            console.log("url : ", url)
            console.log(requestBody)
            console.log(paths.URL_API_ADMIN)
            console.log(paths.EncKey)

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

                // console.log("response : ", JSON.stringify(data)) --dapatkan return dari api service 

                if (data.ErrorCode == "0") {
                    const date = new Date();
                    date.setDate(date.getDate() + 1);

                    setCookie('varCookie', data.Username + "|" + data.ParamKey, { path: '/', expires: new Date(date) })
                    dispatch(setForm("ParamKey", data.ParamKey))
                    dispatch(setForm("Username", data.Username))

                    window.location.href = "/dashboard"

                } else {
                    if (data.ErrMsg === "Akun tidak aktif") {
                        setErrorMessageAlert("Login gagal. Akbun Anda tidak aktif.");
                    } else {
                        setErrorMessageAlert("Login gagal. User ID atau Password tidak cocok.");
                    }
                    setShowAlert(true);
                    return false;
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
    }

    return (
        <div className='container-login'>
            <div className="sidebar">
                <div className="sidebar-header">
                    {/* <img
                        style={{ width: 50, marginRight: 10 }}
                        src={IcApotek}
                        alt="logo"
                    /> */}
                    {/* <span className="dashboard-title">Apotek Dashboard</span> */}
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item-left">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek2} 
                        />
                    </div>

                    <div className="nav-item-right">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek3} 
                        />
                    </div>

                    <div className="nav-item-right">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek4} 
                        />
                    </div>

                    <div className="nav-item-left">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek5} 
                        />
                    </div>

                    <div className="nav-item-right">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek6} 
                        />
                    </div>

                    <div className="nav-item-left">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek7} 
                        />
                    </div>

                    <div className="nav-item-right">
                        <img 
                            style={{ width: 85, marginRight: 10 }}
                            src={IcApotek8} 
                        />
                    </div>
                </nav>
                {/* Small dots on the side */}
                {/* <div className="sidebar-dots">
                    {[...Array(6)].map((_, i) => (
                    <div key={i} className="dot"></div>
                    ))}
                </div> */}
            </div>

            <div className='container-right'>
                <div className='right'>

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

                    {ValidationMessage != "" ?
                        <SweetAlert
                            show={ShowAlert}
                            onConfirm={() => {
                                setShowAlert(false)
                                setValidationMessage("")
                            }}
                            onEscapeKey={() => setShowAlert(false)}
                            onOutsideClick={() => setShowAlert(false)}
                            btnSize="sm"
                        >
                            {() => (
                                <div>
                                    <p style={{ fontSize: '20px', textAlign: 'left' }}><Markup content={ValidationMessage} /></p>
                                </div>
                            )}
                        </SweetAlert>
                        : ""}

                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>Log in to your account</div>

                    <Gap height={30} />

                    <Input
                        label="Username"
                        placeholder="Enter your Username"
                        value={Username}
                        style={{ backgroundColor: "#F6FBFF" }}
                        onChange={event => {
                            setUsername(event.target.value)
                            dispatch(setForm("Username", event.target.value))
                        }}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                handleLogin(Username, Password)
                                event.target.blur()
                            }
                        }}
                    />

                    <Gap height={50} />

                    <Input
                        label="Password"
                        placeholder="Enter your Password"
                        value={Password}
                        type="password"
                        style={{ backgroundColor: "#F6FBFF" }}
                        onChange={event => {
                            setPassword(event.target.value)
                            dispatch(setForm("Password", event.target.value))
                        }}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                handleLogin(Username, Password)
                                event.target.blur()
                            }
                        }}

                    />

                    <Gap height={50} />

                    <Button
                        spinner={Loading}
                        title="Login"
                        onClick={() => handleLogin(Username, Password)}
                        style={{ backgroundColor: "#051070", textAlign: 'center', fontSize: 14, fontWeight: 400 }}
                    />

                </div>
            </div>
        </div>
    )
}

export default Login;