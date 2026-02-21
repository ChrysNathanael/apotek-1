import React from 'react';
import './modal_add_new.css';
import { Modal, CloseButton } from 'react-bootstrap';
import Gap from '../Gap';
import Input from '../Input';

function ModalAddNewKategori({
    onClickShowModal,
    onClickCancel,
    Kategori,
    Deskripsi,
    setKategori,
    setDeskripsi,
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
                        Tambah Kategori Baru
                    </div>
                    <CloseButton onClick={onClickCancel} />
                </div>

                <Gap height={15} />

                {/* NAMA KATEGORI */}
                <div>
                    <span>Nama Kategori</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Nama Kategori"
                        value={Kategori}
                        onChange={setKategori}
                    />
                </div>

                <div>
                    <span>Deskripsi</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Deskripsi"
                        value={Deskripsi}
                        onChange={setDeskripsi}
                    />
                </div>

                <Gap height={10} />

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

export default ModalAddNewKategori;
