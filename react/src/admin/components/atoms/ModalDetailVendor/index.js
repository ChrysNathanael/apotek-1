import React, { useState, useEffect } from 'react';
import './modal_detail_vendor.css';
import { Modal, CloseButton } from 'react-bootstrap';
import Gap from '../Gap';
import Input from '../Input';

function ModalDetailVendor({onClickShowModal, onClickCancel, data, SubmitUpdate}) {
  
    const [formData, setFormData] = useState({
        Id: '',
        NamaVendor: '',
        NomorTelepon: '',
        NomorRekening: '',
        Alamat: '',
        Status: 1
    });

    useEffect(() => {
        if (data) {
            setFormData({
                Id: data.Id || '',
                NamaVendor: data.NamaVendor || '',
                NomorTelepon: data.NomorTelepon || '',
                NomorRekening: data.NomorRekening || '',
                Alamat: data.Alamat || '',
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
                        Detail Vendor
                    </div>
                    <CloseButton onClick={onClickCancel} />
                </div>

                <Gap height={15} />

                <div>
                    <label>Kode Vendor</label>
                    <Gap height={8} />
                    <Input
                        placeholder="Kode Vendor"
                        value={data?.KodeVendor || ''}
                        disabled
                    />
                </div>

                <Gap height={10} />

 
                <div>
                    <label>Nama Vendor</label>
                    <Gap height={8} />
                    <Input
                        placeholder="Nama Vendor"
                        value={formData.NamaVendor}
                        onChange={(e) => handleChange('NamaVendor', e.target.value)}
                    />
                </div>

                <Gap height={10} />


                <div>
                    <label>Nomor Telepon</label>
                    <Gap height={8} />
                    <Input
                        placeholder="Nomor Telepon"
                        value={formData.NomorTelepon}
                        onChange={(e) => handleChange('NomorTelepon', e.target.value)}
                    />
                </div>

                <Gap height={10} />


                <div>
                    <label>Nomor Rekening</label>
                    <Gap height={8} />
                    <Input
                        placeholder="Nomor Rekening"
                        value={formData.NomorRekening}
                        onChange={(e) => handleChange('NomorRekening', e.target.value)}
                    />
                </div>

                <Gap height={10} />


                <div>
                    <label>Alamat</label>
                    <Gap height={8} />
                    <Input
                        placeholder="Alamat"
                        value={formData.Alamat}
                        onChange={(e) => handleChange('Alamat', e.target.value)}
                    />
                </div>

                <Gap height={25} />


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

export default ModalDetailVendor;