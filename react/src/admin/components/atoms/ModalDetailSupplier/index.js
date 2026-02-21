import React, { useEffect, useState } from 'react';
import { Modal, CloseButton } from 'react-bootstrap';
import Gap from '../Gap';
import Input from '../Input';
import './modal_detail_supplier.css';

function ModalDetailSupplier({ onClickShowModal, onClickCancel, data ,SubmitUpdate}) {
   
    const [formData, setFormData] = useState({
        Id: '',
        NamaSupplier: '',
        NomorTelp: '',
        NomorRekening: '',
        Alamat: '',
        Email: '',
        Status: 1
    });

        useEffect(() => {
            if (data) {
                setFormData({ 
                    Id: data.Id || '',
                    NamaSupplier: data.NamaSupplier || '',
                    NomorTelp: data.NomorTelp || '',
                    NomorRekening: data.NomorRekening || '',
                    Alamat: data.Alamat || '',
                    Email: data.Email || '',
                    Status: data.Status || 1
                });
            }
        }, [data]);

        const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

        const handleSubmit = () => {
        SubmitUpdate(formData);
    };

    return (
        <Modal
            show={onClickShowModal}
            onHide={onClickCancel}
            centered
            className="custom-modal"
        >
            <Modal.Body>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                        Detail Supplier
                    </div>
                    <CloseButton onClick={onClickCancel} />
                </div>

                <Gap height={20} />

                <div>
                    <span>Kode Supplier</span>
                    <Gap height={8} />
                    <Input
                        placeholder="Kode Supplier"
                        value={data?.KodeSupplier || ''}
                        disabled
                    />
                </div>

                <Gap height={10} />

                <div>
                    <label>Nama Supplier</label>
                    <Input
                        placeholder="Nama Supplier"
                        value={formData.NamaSupplier}
                        onChange={(e) => handleChange('NamaSupplier', e.target.value)}
                    />
                </div>

                <Gap height={10} />

                <div>
                    <label>Nomor Telepon</label>
                    <Input
                        placeholder="Nomor Telepon"
                        value={formData.NomorTelp}
                        onChange={(e) => handleChange('NomorTelp', e.target.value)}
                    />
                </div>

                <Gap height={10} />

                <div>
                    <label>Nomor Rekening</label>
                    <Input
                        placeholder="Nomor Rekening"
                        value={formData.NomorRekening}
                        onChange={(e) => handleChange('NomorRekening', e.target.value)}
                    />
                </div>

                <Gap height={10} />

                <div>
                    <label>Alamat</label>
                    <Input
                        placeholder="Alamat"
                        value={formData.Alamat}
                        onChange={(e) => handleChange('Alamat', e.target.value)}
                    />
                </div>

                <Gap height={10} />

                <div>
                    <label>Email</label>
                    <Input
                        placeholder="Email"
                        value={formData.Email}
                        onChange={(e) => handleChange('Email', e.target.value)}
                    />
                </div>

                <Gap height={30} />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                        style={{ cursor: 'pointer', marginRight: 15 }}
                        onClick={onClickCancel}
                    >
                        Cancel
                    </div>

                    <div
                        style={{
                            backgroundColor: '#5C2A96',
                            color: '#fff',
                            padding: '6px 15px',
                            borderRadius: 20,
                            cursor: 'pointer'
                        }}
                        onClick={handleSubmit}
                    >
                        Update Data
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ModalDetailSupplier;
