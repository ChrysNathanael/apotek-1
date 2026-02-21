import React, { useState } from 'react';
import './modal_add_new.css';
import { Col, Form, Modal, Row, CloseButton, Alert } from 'react-bootstrap';
import Gap from '../Gap';
import Dropdown from '../Dropdown';
import Input from '../Input';
import {icQuestionMark} from '../../../assets';

function ModalExport({ onClickShowModal, onClickCancel, listSupplier, listSatuan, listKategori, namaObat, setNamaObat, supplier, setSupplier, satuan, setSatuan, kategori, setKategori, cancelAddNew, submitAddNew }) {
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
                <div style={{ display:'flex', justifyContent:'space-between'}}>
                    <div style={{ fontSize:20, fontWeight:800, color:'black' }}>Tambah Obat Baru</div>
                    <div>
                        <CloseButton aria-label = "close" onClick={onClickCancel}/>
                    </div>
                </div>

                <Gap height={10} />

                <div>
                    <span style={{ color:'black', fontWeight:100 }}>Nama Obat</span>
                    <Gap height={10}/>
                    <div style={{display:'flex', alignItems:'center', border:'1px solid grey', borderRadius:10, width:'100%'}}>
                        <div style={{flex:'0 0 90%'}}>
                            <Input
                                placeholder={"Nama Obat"}
                                value={namaObat}
                                onChange={setNamaObat}
                                style={{
                                    paddingLeft:'10px',
                                    color:'grey',
                                    border:'1px solid white',
                                    borderRadius:50,
                                    backgroundColor:'transparent',
                                    display: 'flex',
                            }}/>
                        </div>
                    </div>
                </div>

                <Gap height={10} />

                <div>
                    <span style={{ color:'black', fontWeight:100 }}>Supplier Obat</span>
                    <Gap height={10}/>
                    <Dropdown
                        onChange={setSupplier}
                        className="form-dropdown">
                        <option value="">Select Supplier</option>
                        {listSupplier?.map((item,index) => {
                            return <option value={item.Id} selected={supplier === item.Id}>{item.NamaSupplier}</option>
                        })}
                    </Dropdown>
                </div>

                <Gap height={10} />

                <div>
                    <span style={{ color:'black', fontWeight:100 }}>Satuan Obat</span>
                    <Gap height={10}/>
                    <Dropdown
                        onChange={setSatuan}
                        className="form-dropdown">
                        <option value="">Select Satuan</option>
                        {listSatuan?.map((item,index) => {
                            return <option value={item.Id} selected={satuan === item.Id}>{item.Satuan}</option>
                        })}
                    </Dropdown>
                </div>

                <Gap height={10} />

                <div>
                    <span style={{ color:'black', fontWeight:100 }}>Kategori Obat</span>
                    <Gap height={10}/>
                    <Dropdown
                        onChange={setKategori}
                        className="form-dropdown">
                        <option value="">Select Kategori</option>
                        {listKategori?.map((item,index) => {
                            return <option value={item.Id} selected={kategori === item.Id}>{item.Kategori}</option>
                        })}
                    </Dropdown>
                </div>

                <Gap height={30} />

                <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
                    <div style={{ cursor: 'pointer', fontSize:15 }} onClick={cancelAddNew}>Cancel</div>
                    <Gap width={10} />
                    <div style={{ backgroundColor:'#111111', height:30, borderRadius:25, color:'#FFFFFF', fontSize:13, cursor:'pointer', textAlign:'center', paddingLeft:10, paddingRight:10 }}>
                        
                        <div style={{ marginTop:4 }} onClick={submitAddNew}>Tambah Data</div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ModalExport;