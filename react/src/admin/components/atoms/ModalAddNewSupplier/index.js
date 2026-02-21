import React from 'react';
import './modal_add_new.css';
import { Modal, CloseButton } from 'react-bootstrap';
import Gap from '../Gap';
import Input from '../Input';

function ModalAddNewSupplier({
    onClickShowModal,
    onClickCancel,
    NamaSupplier,
    setNamaSupplier,
    NomorTelp,
    setNomorTelp,
    NomorRekening,
    SetNomorRekening,
    Alamat,
    SetAlamat,
    Email,
    SetEmail,
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
                        Tambah Supplier Baru
                    </div>
                    <CloseButton onClick={onClickCancel} />
                </div>

                <Gap height={15} />

                {/* NAMA SUPPLIER */}
                <div>
                    <span>Nama Supplier</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Nama Supplier"
                        value={NamaSupplier}
                        onChange={setNamaSupplier}
                    />
                </div>

                <Gap height={10} />

                {/* NOMOR TELP */}
                <div>
                    <span>Nomor Telepon</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Nomor Telepon"
                        value={NomorTelp}
                        onChange={setNomorTelp}
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

                <Gap height={10} />

                {/* EMAIL */}
                <div>
                    <span>Email</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Email"
                        value={Email}
                        onChange={SetEmail}
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

export default ModalAddNewSupplier;
