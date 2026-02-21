import React, { useState } from 'react';
import './modal_filter.css';
import { Col, Form, Modal, Row, CloseButton } from 'react-bootstrap';
import Gap from '../Gap';
import Dropdown from '../Dropdown';
import Input from '../Input';

function ModalFilterSatuan({ onClickShowModal, onClickCancel, filterBy, setFilterBy, searchFilter, setSearchFilter, statusFilter, setStatusFilter, startDate, setStartDate, endDate, setEndDate, resetFilter, submitFilter, showDateFilter = false, showStatusFilter = false, showSearchFilter = false, showName = false, showSatuan = false }) {
    console.log("filterBy : ", filterBy)
    return (
        <Modal
            show={onClickShowModal}
            onHide={onClickCancel}
            size="xs"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="custom-modal"
        >
            <Modal.Body>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Filter Settings</div>
                        <CloseButton aria-label = "close" onClick={onClickCancel}/>
                </div>

                <Gap height={10} />

                {showSearchFilter && ( 
                    <><div style={{ fontWeight: 'bold', fontSize: 13 }}>Sort By</div>
                    <Row>
                        <Col xs={3} md={6} lg={6} style={{ paddingRight: 6 }}>
                            <Dropdown
                                onChange={setFilterBy}>
                                <option value="">Select Filter</option>
                                {showSatuan && (
                                    <option value="satuan" selected={filterBy === "satuan"}>Satuan</option>
                                )}
                            </Dropdown>
                        </Col>
                        <Col xs={3} md={6} lg={6} style={{ paddingLeft: 6 }}>
                            <Input
                                placeHolder="Input Search"
                                value={searchFilter}
                                style={{ borderColor: 'silver', marginTop: 12 }}
                                onChange={setSearchFilter} />
                        </Col>
                    </Row></>
                )}
                
                <Gap height={15} />

                {showStatusFilter && (
                    <><div style={{ fontWeight: 'bold', fontSize: 13 }}>Status</div><Row>
                        <Col xs={3} md={6} lg={6} style={{ paddingRight: 6 }}>
                            <Dropdown
                                onChange={setStatusFilter}>
                                <option value="">Select Type</option>
                                <option value="1" selected={statusFilter === "1"}>Active</option>
                                <option value="0" selected={statusFilter === "0"}>Inactive</option>
                            </Dropdown>
                        </Col>
                    </Row></>)}

                <Gap height={15} />
                {showDateFilter && (
                    <Row>
                        <Col xs={3} md={6} lg={6} style={{ paddingRight: 6 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 13 }}>Start Date</div>
                            <Gap height={10} />
                            <Form.Control
                                type="date"
                                onChange={setStartDate}
                                value={startDate}
                            />
                        </Col>
                        <Col xs={3} md={6} lg={6} style={{ paddingLeft: 6 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 13 }}>End Date</div>
                            <Gap height={10} />
                            <Form.Control
                                type="date"
                                onChange={setEndDate}
                                value={endDate}
                            />
                        </Col>
                    </Row>)}

                <Gap height={30} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ cursor: 'pointer', fontSize:15 }} onClick={resetFilter}>Reset Filter</div>
                    <Gap width={10} />
                    <div style={{ backgroundColor: '#111111', width: 60, height: 30, borderRadius: 25, color: '#FFFFFF', fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ marginTop: 4 }} onClick={submitFilter}>Apply</div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
    
export default  ModalFilterSatuan;