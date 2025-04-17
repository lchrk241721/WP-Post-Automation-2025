document.addEventListener('DOMContentLoaded', function() {
    // File upload handling
    const excelFileInput = document.getElementById('excelFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    
    uploadBtn.addEventListener('click', function() {
        excelFileInput.click();
    });
    
    excelFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
            fileInfo.classList.remove('d-none');
        } else {
            fileInfo.classList.add('d-none');
        }
    });

    // Timezone detection
    const timezoneBtn = document.getElementById('timezoneBtn');
    const scheduleTime = document.getElementById('scheduleTime');
    const smsGroup = document.getElementById('smsGroup');
    
    timezoneBtn.addEventListener('click', function() {
        try {
            // Get current datetime in local timezone
            const now = new Date();
            const timezoneOffset = now.getTimezoneOffset() / 60;
            
            // Format for datetime-local input
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const localDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
            scheduleTime.value = localDatetime;
            
            // Check if timezone is India (IST is UTC+5:30)
            if (timezoneOffset === -5.5) {
                smsGroup.classList.remove('disabled-field');
                document.getElementById('smsYes').disabled = false;
                document.getElementById('smsNo').disabled = false;
            } else {
                smsGroup.classList.add('disabled-field');
                document.getElementById('smsYes').disabled = true;
                document.getElementById('smsNo').disabled = true;
                alert('SMS alerts are only available for Indian timezone (IST) users.');
            }
        } catch (e) {
            console.error('Timezone detection failed:', e);
            alert('Could not detect timezone automatically. Please set manually.');
        }
    });

    // SMS alert toggle
    const smsYes = document.getElementById('smsYes');
    const phoneNumberGroup = document.getElementById('phoneNumberGroup');
    
    smsYes.addEventListener('change', function() {
        if (this.checked) {
            phoneNumberGroup.classList.remove('d-none');
        }
    });
    
    document.getElementById('smsNo').addEventListener('change', function() {
        if (this.checked) {
            phoneNumberGroup.classList.add('d-none');
        }
    });

    // Clear form
    const clearBtn = document.getElementById('clearBtn');
    
    clearBtn.addEventListener('click', function() {
        document.getElementById('automationForm').reset();
        fileInfo.classList.add('d-none');
        phoneNumberGroup.classList.add('d-none');
        smsGroup.classList.remove('disabled-field');
    });

    // Form submission
    const automationForm = document.getElementById('automationForm');
    const submitBtn = document.getElementById('submitBtn');
    
    automationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!document.getElementById('websiteUrl').checkValidity()) {
            alert('Please enter a valid HTTPS website URL');
            return;
        }
        
        if (!excelFileInput.files.length) {
            alert('Please upload an Excel file');
            return;
        }
        
        if (!scheduleTime.value) {
            alert('Please select a schedule time');
            return;
        }
        
        if (smsYes.checked && !document.getElementById('phoneNumber').checkValidity()) {
            alert('Please enter a valid 10-digit Indian phone number');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
        
        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('websiteUrl', document.getElementById('websiteUrl').value);
            formData.append('excelFile', excelFileInput.files[0]);
            formData.append('scheduleTime', scheduleTime.value);
            formData.append('smsAlert', document.querySelector('input[name="smsAlert"]:checked').value);
            if (smsYes.checked) {
                formData.append('phoneNumber', document.getElementById('phoneNumber').value);
            }
            
            // Send to server
            const response = await fetch('/api/start-automation', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Automation started successfully!');
                // Reset form after successful submission
                automationForm.reset();
                fileInfo.classList.add('d-none');
                phoneNumberGroup.classList.add('d-none');
            } else {
                throw new Error(result.message || 'Failed to start automation');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-play me-2"></i>START AUTOMATION';
        }
    });
});