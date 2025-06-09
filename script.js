document.addEventListener('DOMContentLoaded', function() {
    const orderIdInput = document.getElementById('orderId');
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    const statusResultDiv = document.getElementById('statusResult');

    const SPREADSHEET_ID = '1i3S3mL_2sR0dyll59-woTx981mLDexvYRc79eWd6Ztw'; 
    const SHEET_GID = '0';         

    // URL สำหรับดึงข้อมูลจาก Google Sheet ในรูปแบบ JSON
    // 'gviz/tq' คือ Google Visualization API Query Language
    // 'tqx=out:json' คือ ให้ส่งออกผลลัพธ์เป็น JSON
    const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/1i3S3mL_2sR0dyll59-woTx981mLDexvYRc79eWd6Ztw/edit?usp=sharing ${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

    let orderStatuses = {}; // Object สำหรับเก็บข้อมูลสถานะสินค้าที่ดึงมาจาก Google Sheet

    // ฟังก์ชันสำหรับโหลดข้อมูลจาก Google Sheet
    async function loadOrderStatuses() {
        try {
            statusResultDiv.innerHTML = '<p class="loading">กำลังโหลดข้อมูลสถานะ...</p>';
            const response = await fetch(GOOGLE_SHEET_URL);
            const data = await response.text(); // รับข้อมูลเป็น text เพราะมันไม่ใช่ JSON ตรงๆ
            
            // Google Sheet API จะส่งกลับมาเป็น JSONP คล้ายๆ
            // text เช่น "google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"..."...})"
            // เราต้องตัดส่วนที่ไม่จำเป็นออกไป เพื่อให้เหลือแต่ JSON จริงๆ
            const jsonString = data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1);
            const jsonData = JSON.parse(jsonString);

            // แปลงข้อมูลจาก Google Sheet ให้อยู่ในรูปแบบ Object ที่เราต้องการ
            const rows = jsonData.table.rows;
            const headers = jsonData.table.cols.map(col => col.label); // ดึงชื่อ Header (Order ID, Status, Details, ETA)

            rows.forEach(row => {
                const rowData = {};
                row.c.forEach((cell, index) => {
                    const header = headers[index];
                    // ถ้า cell มีค่า (v) ให้ใช้ค่า v, ถ้าไม่มีแต่มีค่าที่ถูกจัดรูปแบบ (f) ให้ใช้ค่า f, ถ้าไม่มีเลยให้เป็น empty string
                    rowData[header] = cell ? (cell.v || cell.f || '') : '';
                });

                // ใช้ 'Order ID' เป็น Key ใน orderStatuses object
                if (rowData['Order ID']) {
                    orderStatuses[rowData['Order ID'].toUpperCase()] = { // แปลงเป็นตัวพิมพ์ใหญ่เพื่อการค้นหา
                        status: rowData['Status'],
                        details: rowData['Details'],
                        eta: rowData['ETA']
                    };
                }
            });
            statusResultDiv.innerHTML = ''; // ลบข้อความกำลังโหลด
            console.log("Order statuses loaded from Google Sheet:", orderStatuses);

        } catch (error) {
            console.error("Error loading data from Google Sheet:", error);
            statusResultDiv.innerHTML = '<p class="not-found">ไม่สามารถโหลดข้อมูลสถานะได้ กรุณาลองใหม่ภายหลัง</p>';
        }
    }

    // โหลดข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
    loadOrderStatuses();

    checkStatusBtn.addEventListener('click', function() {
        const inputId = orderIdInput.value.trim().toUpperCase();

        if (inputId === "") {
            statusResultDiv.innerHTML = '<p class="not-found">กรุณากรอกเลขที่ออเดอร์</p>';
            return;
        }

        const statusInfo = orderStatuses[inputId];

        if (statusInfo) {
            statusResultDiv.innerHTML = `
                <p><strong>เลขที่ออเดอร์:</strong> ${inputId}</p>
                <p><strong>สถานะปัจจุบัน:</strong> ${statusInfo.status}</p>
                <p><strong>รายละเอียด:</strong> ${statusInfo.details}</p>
                <p><strong>กำหนดการ:</strong> ${statusInfo.eta}</p>
            `;
        } else {
            statusResultDiv.innerHTML = `
                <p class="not-found">ไม่พบเลขที่ออเดอร์นี้ กรุณาตรวจสอบอีกครั้ง</p>
            `;
        }
    });

    orderIdInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkStatusBtn.click();
        }
    });
});
