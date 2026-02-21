import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import LoginAdmin from '../../admin/pages/Login';
import MainApp from '../../admin/pages/MainApp';

const Routes = () => {
   	return (
       	<Router >
           	<Switch>
				{/* <Route path='/'>
					<LoginAdmin />
				</Route> */}
				<Route exact path="/dashboard">
					<MainApp/>
				</Route>
				<Route exact path="/master-obat">
					<MainApp/>
				</Route>
				<Route exact path="/master-supplier">
					<MainApp/>
				</Route>
				<Route exact path="/master-satuan">
					<MainApp/>
				</Route>
				<Route exact path="/master-kategori">
					<MainApp/>
				</Route>
				<Route exact path="/penjualan-obat">
					<MainApp/>
				</Route>
				<Route exact path="/master-vendor">
					<MainApp/>
				</Route>
				<Route path='/'>
					<LoginAdmin/>
				</Route>
           	</Switch>
       	</Router>
    )
}

export default Routes;
