

import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { Logout } from '../../../utils/functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { hover } from '@testing-library/user-event/dist/hover';
import React, { useEffect, useState} from 'react';
import { useCookies } from 'react-cookie';
import { FaBoxes, FaImages, FaNetworkWired, FaTags, FaUserMinus, FaBars, FaUsers, FaUsersCog, FaComment } from 'react-icons/fa';
// import { useIntl } from 'react-intl';
import { Menu, MenuItem, Sidebar, SubMenu, useProSidebar, sidebarClasses, menuClasses } from 'react-pro-sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { favicon, IcActiveUserActiveBU, IcActiveUserBU, IcContent, IcDashboard, IcDashboardActiveBU, IcDashboardBU, IcDepositActiveBU, IcDepositBU, IcLogoutBU, IcMarketing, IcMasterData, IcMenu, IcMerchant, IconCollapse, IconContent, IconContentActive, IconDashboard, IconDotsVertical, IconMarketing, IconMarketingActive, IconMerchant, IconMerchantActive, IconOther, IconOtherActive, IconOverview, IconProfile, IconReport, IconReportActive, IconSetting, IconStarvoucher, IconStarvoucherActive, IconUser, IconVoucher, IcOther, IcOverview, IcRedemptionActiveBU, IcRedemptionBU, IcRegisteredUserActiveBU, IcRegisteredUserBU, IcSettingActiveBU, IcSettingBU, IcStarpoinReport, IcStarvoucher, IcTransaction, IcTransaksi } from '../../../assets';
// import sidebarBg from './assets/bg1.jpg';
import { setForm } from '../../../redux';
import { paths } from '../../../utils';
import { fetchStatus, generateSignature } from '../../../utils/functions';
// import { Button } from 'bootstrap';
import { Button, Gap, ModalLogout } from '../../atoms';
import './LeftMenu.css';

const LeftMenu = ({ image, collapsed, rtl, toggled, handleToggleSidebar }) => {

	if (window) {
		var vMenu = [];
		var sessionstore = (sessionStorage.getItem('MNStore'));
		if (sessionstore != null && sessionstore != "" && sessionstore != []) {
			sessionstore = JSON.parse((sessionstore));
			vMenu = sessionstore;
		}
	}

	const { collapseSidebar } = useProSidebar();
	const { toggleSidebar, broken } = useProSidebar();

  	const history = useHistory();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);
    const { form }=useSelector(state=>state.PaketReducer);
    const dispatch = useDispatch()
    const [ListMenu,setListMenu] = useState(vMenu)
    const [PageActive,setPageActive] = useState(1)
    const [RowPage,setRowPage] = useState(20)
    const [OrderBy,setOrderBy] = useState("")
    const [Order,setOrder] = useState("DESC")
    const [Nama,setNama] = useState("")
    const [Role,setRole] = useState("")

	const [ShowModalLogout, setShowModalLogout] = useState(false)

    useEffect(() => {
		if (window) {
			var sessionstore = (sessionStorage.getItem('MNStore'));
			if (sessionstore != null && sessionstore != "" && sessionstore != []) {
				sessionstore = JSON.parse((sessionstore));
				setListMenu(sessionstore)
			} else {
			}
		} else {
		}

		loadMenu()

		if (window.innerWidth < 1024) {
			collapseSidebar(true);
		}

    },[])

  	const loadMenu = () => {
		var cookieParamKey = getCookie("paramkey");
		var cookieUsername = getCookie("userid");

		var requestBody = JSON.stringify( {
			"Username": cookieUsername,
			"ParamKey": cookieParamKey,
			"Method": "SELECT",
			"Page": 1,
			"RowPage": -1
		});

		var url = paths.URL_API_ADMIN + 'Menu';
		var Signature  = generateSignature(paths.EncKey,requestBody)
		
		fetch( url, {
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
			if (data.ErrorCode == "0") {
				setListMenu(data.Result)
				if (window) {
					sessionStorage.setItem('MNStore', (JSON.stringify(data.Result)));
				}
				
				if (data.TotalRecords<1) {
					// setResultMessage("Data tidak ditemukan")
				}
			} else {
				if (data.ErrorMessage == "Param Key Expired") {
					logout()
					// setSessionMessage("Session Anda Telah Habis. Silahkan Login Kembali.");
					// setShowAlert(true);
				}
			}
		})
		.catch((error) => {
			if (error.message == 401) {
				// logout()
				// setErrorMessageAlertLogout("Maaf anda tidak memiliki ijin untuk mengakses halaman ini.");
				// setShowAlert(true);
			} else if (error.message != 401) {
				// setErrorMessageAlert(AlertMessage.failedConnect);
				// setShowAlert(true);
			}
			// setResultMessage("")
		});
	}

	const handleLogout = () => {
		setShowModalLogout(!ShowModalLogout)
	}

    const logout = () => {
		setCookie('varCookie', "", { path: '/' })
        removeCookie('varCookie', { path: '/'});
        removeCookie('varMerchantId', { path: '/'});
        removeCookie('varIdVoucher', { path: '/'});
        removeCookie('varUser', { path: '/'});
        removeCookie('varUserLogin', { path: '/'});
		dispatch(setForm("ParamKey",''))
		dispatch(setForm("UserID",''))
		if(window){
			sessionStorage.clear();
		}
		history.push('/login')
		return
    }

    const getCookie = (tipe) => {
        var SecretCookie = cookies.varCookie;
        if (SecretCookie != "" && SecretCookie != null && typeof SecretCookie=="string") {
            var LongSecretCookie = SecretCookie.split("|");
            var UserID = LongSecretCookie[0];
            var ParamKeyArray = LongSecretCookie[1];
			var PartnerCode = LongSecretCookie[2]
            var ParamKey = ParamKeyArray.substring(0, ParamKeyArray.length)
      
            if (tipe == "userid") {
                return UserID;            
            } else if (tipe == "paramkey") {
                return ParamKey;
            } else if (tipe == "partnercode") {
				return PartnerCode
			} 
			else {
                return null;
            }
        } else {
          	return null;
        }
    }

  return (
    	<div style={{ height: '100vh', backgroundColor:'red' }}>

			{broken && (
			<img
				src={IcMenu}
				onClick={handleToggleSidebar}
				style={{
					width: 24,
					cursor: 'pointer',
					position: 'fixed',
					top: 20,
					left: 20,
					zIndex: 9999
				}}
			/>
			)}

			<Sidebar
				breakPoint="md"
				collapsedWidth="70px"
				width="250px"
				toggled={toggled}
				onBackdropClick={handleToggleSidebar}
				rootStyles={{
					[`.${sidebarClasses.container}`]: {
					backgroundColor: '#FFFFFF',
					height: '100vh',
					},
				}}
			>
				
			{((getCookie("paramkey")!=null && getCookie("paramkey")!="" &&
				getCookie("userid")!=null && getCookie("userid")!="") || (form.ParamKey!=null && form.ParamKey!="" &&
				form.UserID!=null && form.UserID!=""))
				&& 
				<div>
					<Menu 
					rootStyles={{
						['.' + menuClasses.button]: {
							backgroundColor: '#FFFFFF',
							color: '#61308C',
							textDecorationColor:'transparent',
							height:40,
							paddingLeft:0,
							'&:hover': {
								backgroundColor: '#FFFFFF',
							},
						},
					}}>
						<div>
							<div style={{ margin:30, display:'flex', flexDirection:'row', alignItems:'center' }}>
								{/* <img
									style={{ width: 50, marginRight: 10, cursor:'pointer'}}
									src={favicon}
									alt="logo"
								/> */}
								<span className="dashboard-title">Apotek Dashboard</span>
							</div>

							{ListMenu.length > 0 && ListMenu.map((item, index) => {
								if (item.Menu === "Dashboard") {
								return (
									<MenuItem
										key={index}
										icon={<img src={IcDashboard} style={{ width:18 }} />}
										active={form.PageActive === item.PageActive}
										onClick={() => {
											window.location.href = '/dashboard'
											if (broken) toggleSidebar(false);
										}}
									>Dashboard</MenuItem>)
								}

								if (item.Menu === "Master Data") {
								return (
									<SubMenu
										key={index}
										label="Master Data"
										icon={<img src={IcMasterData} style={{ width:18 }} />}
									>
										{item.Item.map((item2,index2) => {
											return <MenuItem 
												onClick={() => {
													window.location.href = item2.Href
													if (broken) toggleSidebar(false);
												}}>{item2.SubMenu}
											</MenuItem>
										})}
									</SubMenu>
								)
								}

								if (item.Menu === "Transaksi") {
								return (
									<SubMenu
										key={index}
										label="Transaksi"
										icon={<img src={IcTransaksi} style={{ width:18 }} />}
									>
										{item.Item.map((item2,index2) => {
											return <MenuItem 
												onClick={() => {
													window.location.href = item2.Href
													if (broken) toggleSidebar(false);
												}}>{item2.SubMenu}
											</MenuItem>
										})}
									</SubMenu>
								)
								}

								return null
								})}							
						</div>
					</Menu>

					<hr />

					<Gap height={20} />
					
					<div onClick={() => handleLogout()} style={{ textDecorationColor:'transparent', cursor:'pointer' }}>
						<div style={{ display:'flex', alignItems:'center', marginLeft:15, marginRight:15 }} class="active">
							<img src={IcLogoutBU} style={{ width:18, marginLeft:10 }} />
							<div style={{ color:'#1C1C1C', fontSize:16, fontWeight:'bold', marginLeft:10, paddingTop:10, paddingBottom:10 }}>Logout</div>
						</div>
					</div>
				</div>
			}
			</Sidebar>

			<ModalLogout
				onClickShowModal={ShowModalLogout}
				onClickCancel={() => setShowModalLogout(false)}
				onClickLogout={() => logout()}
			/>

			<div>
				{broken && (
					<img src={IcMenu} onClick={() => toggleSidebar()} style={{width:20, cursor:'pointer'}}></img>
					// <button className="sb-button" onClick={() => toggleSidebar()}>
					// Toggle
					// </button>
				)}
			</div>
		</div>
  );
};

export default LeftMenu;