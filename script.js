document.addEventListener('DOMContentLoaded', function() {
    const orderIdInput = document.getElementById('orderId');
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    const statusResultDiv = document.getElementById('statusResult');

    checkStatusBtn.addEventListener('click', function() {
        const inputId = orderIdInput.value.trim().toUpperCase(); // ตัดช่องว่างและเปลี่ยนเป็นตัวพิมพ์ใหญ่

        if (inputId === "") {
            statusResultDiv.innerHTML = '<p class="not-found">กรุณากรอกเลขที่ออเดอร์</p>';
            return; // หยุดการทำงาน
        }

        // ตรวจสอบว่า orderStatuses ถูกโหลดมาแล้วหรือไม่
        if (typeof orderStatuses === 'undefined') {
            statusResultDiv.innerHTML = '<p class="not-found">เกิดข้อผิดพลาดในการโหลดข้อมูลสถานะ</p>';
            console.error("orderStatuses data is not loaded.");
            return;
        }

        const statusInfo = orderStatuses[inputId];

        if (statusInfo) {
            // แสดงผลสถานะ
            statusResultDiv.innerHTML = `
                <p><strong>เลขที่ออเดอร์:</strong> ${inputId}</p>
                <p><strong>สถานะปัจจุบัน:</strong> ${statusInfo.status}</p>
                <p><strong>รายละเอียด:</strong> ${statusInfo.details}</p>
                <p><strong>กำหนดการ:</strong> ${statusInfo.eta}</p>
            `;
        } else {
            // ไม่พบข้อมูล
            statusResultDiv.innerHTML = `
                <p class="not-found">ไม่พบเลขที่ออเดอร์นี้ กรุณาตรวจสอบอีกครั้ง</p>
            `;
        }
    });

    // เพิ่มฟังก์ชันให้กด Enter แล้วค้นหาได้
    orderIdInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkStatusBtn.click(); // เสมือนกดปุ่ม
        }
    });
});