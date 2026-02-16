-- DB SUPPLIER OBAT --
create table db_supplier_obat
(
    id          int auto_increment
        primary key,
    id_obat     int          null,
    id_supplier int          null,
    harga       varchar(100) null,
    status      int          null
);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (1, 1, 1, '5000', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (2, 1, 2, '4000', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (3, 1, 3, '7000', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (4, 2, 1, '8000', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (5, 2, 2, '10000', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (6, 2, 3, '4500', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (7, 3, 4, '2500', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (8, 3, 5, '8000', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (9, 3, 6, '15000', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (10, 4, 1, '7500', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (11, 4, 2, '12000', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (12, 4, 3, '12500', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (13, 5, 2, '6009', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (14, 5, 3, '2354', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (15, 5, 4, '1566', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (16, 6, 3, '12500', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (17, 6, 5, '5002', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (18, 6, 6, '6050', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (19, 7, 7, '3256', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (20, 7, 8, '2743', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (21, 7, 5, '3463', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (22, 8, 1, '3473', 0);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (23, 8, 4, '6584', 1);
INSERT INTO db_apotek.db_supplier_obat (id, id_obat, id_supplier, harga, status) VALUES (24, 8, 5, '7347', 1);

-- DB USER --
create table db_user
(
    id    int auto_increment
        primary key,
    nama  varchar(100) null,
    no_hp varchar(20)  null,
    email varchar(100) null,
    tgl   datetime     null
);
INSERT INTO db_apotek.db_user (id, nama, no_hp, email, tgl) VALUES (1, 'Jemi', '087785744440', 'jemi@gmail.com', '2026-02-15 19:00:52');
INSERT INTO db_apotek.db_user (id, nama, no_hp, email, tgl) VALUES (2, 'Chrys', '081226381071', 'yosua@gmail.com', '2026-02-15 19:01:21');
INSERT INTO db_apotek.db_user (id, nama, no_hp, email, tgl) VALUES (3, 'Laoere', '082118009042', 'laoere@gmail.com', '2026-02-15 19:01:22');

-- DB TRANSAKSI TEMP --
create table db_transaksi_temp
(
    id             int auto_increment
        primary key,
    nama           varchar(100) null,
    json_transaksi text         null,
    tgl_input      datetime     null
);
INSERT INTO db_apotek.db_transaksi_temp (id, nama, json_transaksi, tgl_input) VALUES (2, 'jemi', '[{"KodeObat":"","NamaObat":"Paracetamol 500mg","Jumlah":100,"HargaSatuan":"4000","SubTotal":400000,"Supplier":"PT Sanbe Farma"},{"KodeObat":"","NamaObat":"Amoxicillin 500mg","Jumlah":20,"HargaSatuan":"10000","SubTotal":200000,"Supplier":"PT Sanbe Farma"}]', '2026-02-15 16:18:02');
INSERT INTO db_apotek.db_transaksi_temp (id, nama, json_transaksi, tgl_input) VALUES (3, 'yosua', '[{"KodeObat":"","NamaObat":"Paracetamol 500mg","Jumlah":100,"HargaSatuan":"4000","SubTotal":400000,"Supplier":"PT Sanbe Farma"},{"KodeObat":"","NamaObat":"Amoxicillin 500mg","Jumlah":20,"HargaSatuan":"10000","SubTotal":200000,"Supplier":"PT Sanbe Farma"}]', '2026-02-15 16:19:53');

