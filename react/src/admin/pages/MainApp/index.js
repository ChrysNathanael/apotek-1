import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { FaBars } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { BrowserRouter , Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import LeftMenu from '../../components/molecules/LeftMenu'
import { historyConfig } from '../../utils/functions'
import { ProSidebarProvider } from 'react-pro-sidebar';
import './mainApp.scss'
// import InputListMenuLogin from '../ListMenuLogin/InputListMenuLogin'
import Dashboard from '../Dashboard'
import MasterObat from '../MasterObat'
import MasterSupplier from '../MasterSupplier'
import MasterSatuan from '../MasterSatuan'
import MasterKategori from '../MasterKategori'
import MasterVendor from '../MasterVendor'
import PenjualanObat from '../PenjualanObat'

const MainApp = () => {
    const history = useHistory(historyConfig);

    let match = useRouteMatch();
    const [cookies, setCookie,removeCookie] = useCookies(['user']);

    const [rtl, setRtl] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [image, setImage] = useState(true);
    const [toggled, setToggled] = useState(false);

    const handleToggleSidebar = (value) => {
        setToggled(value);
    };

    const {form}=useSelector(state=>state.PaketReducer);

    useEffect(()=>{
        document.title = "Admin Apotek";
    },[])
    
    return (
        <div className="main-app-wrapper mainapp" style={{ flexDirection:form.PageActive=="Post" ? 'column':'row', backgroundColor:'#F6FBFF', width:'100%'}}>

            {form.PageActive!="Post" &&
            <ProSidebarProvider>
                <LeftMenu
                    image={image}
                    collapsed={collapsed}
                    rtl={rtl}
                    toggled={toggled}
                    handleToggleSidebar={() => setToggled(!toggled)}
                />
            </ProSidebarProvider>
            }

            <div className="content-wrapper" style={{ backgroundColor:'#F6FBFF', height:'100%'}}>
                 <div style={{ marginLeft:40,marginTop:15 }} className="btn-toggle" onClick={() => handleToggleSidebar(true)}>
                     <FaBars />
                </div>
                <BrowserRouter basename="/">
                    <Switch>
                        <Route exact path="/dashboard">
                            <Dashboard />
                        </Route>
                        <Route exact path="/master-obat">
                            <MasterObat />
                        </Route>
                        <Route exact path="/master-supplier">
                            <MasterSupplier />
                        </Route>
                        <Route exact path="/master-satuan">
                            <MasterSatuan />
                        </Route>
                        <Route exact path="/master-kategori">
                            <MasterKategori />
                        </Route>
                        <Route exact path="/master-vendor">
                            <MasterVendor />
                        </Route>
                        <Route exact path="/penjualan-obat">
                            <PenjualanObat />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        </div>
    )
}

export default MainApp