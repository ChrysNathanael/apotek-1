import React from 'react';
import './modal_add_new.css';
import { Modal, CloseButton } from 'react-bootstrap';
import Gap from '../Gap';
import Input from '../Input';

function ModalAddNewVendor({
    onClickShowModal,
    onClickCancel,
    NamaVendor,
    setNamaVendor,
    NomorTelepon,
    setNomorTelepon,
    NomorRekening,
    SetNomorRekening,
    Alamat,
    SetAlamat,
    cancelAddNew,
    submitAddNew
}) {
    return (
        <Modal
            show={onClickShowModal}
            onHide={onClickCancel}
            centered
            className="custom-modal"
        >
            <Modal.Body>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                        Tambah Vendor Baru
                    </div>
                    <CloseButton onClick={onClickCancel} />
                </div>

                <Gap height={15} />

                {/* NAMA VENDOR */}
                <div>
                    <span>Nama Vendor</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Nama Vendor"
                        value={NamaVendor}
                        onChange={setNamaVendor}
                    />
                </div>

                <Gap height={10} />

                {/* NOMOR TELEPON */}
                <div>
                    <span>Nomor Telepon</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Nomor Telepon"
                        value={NomorTelepon}
                        onChange={setNomorTelepon}
                    />
                </div>

                <Gap height={10} />

                {/* NOMOR REKENING */}
                <div>
                    <span>Nomor Rekening</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Nomor Rekening"
                        value={NomorRekening}
                        onChange={SetNomorRekening}
                    />
                </div>

                <Gap height={10} />

                {/* ALAMAT */}
                <div>
                    <span>Alamat</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Alamat"
                        value={Alamat}
                        onChange={SetAlamat}
                    />
                </div>

                <Gap height={25} />

                {/* FOOTER */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                        style={{ cursor: 'pointer', marginRight: 15 }}
                        onClick={cancelAddNew}
                    >
                        Cancel
                    </div>

                    <div
                        style={{
                            backgroundColor: '#111',
                            color: '#fff',
                            padding: '6px 15px',
                            borderRadius: 20,
                            cursor: 'pointer'
                        }}
                        onClick={submitAddNew}
                    >
                        Tambah Data
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ModalAddNewVendor;