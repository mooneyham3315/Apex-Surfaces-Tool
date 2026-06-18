window.addEventListener('DOMContentLoaded', function () {
    // --- Company Logo Preview ---
    const compLogoInput = document.getElementById('compLogo');
    const logoPreview = document.getElementById('logoPreview');
    if (compLogoInput) {
        compLogoInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    logoPreview.src = e.target.result;
                    logoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                logoPreview.src = '';
                logoPreview.style.display = 'none';
            }
        });
    }

    // --- Company Info Save ---
    const companyForm = document.getElementById('companyForm');
    if (companyForm) {
        companyForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const compName = document.getElementById('compName').value;
            const compPhone = document.getElementById('compPhone').value;
            const compEmail = document.getElementById('compEmail').value;
            const logoSrc = logoPreview ? logoPreview.src : '';
            const companyInfo = { compName, compPhone, compEmail, logoSrc };
            localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
            alert('Company info saved!');
        });

        // Fill saved company info on reload
        const saved = localStorage.getItem('companyInfo');
        if (saved) {
            const companyInfo = JSON.parse(saved);
            document.getElementById('compName').value = companyInfo.compName || '';
            document.getElementById('compPhone').value = companyInfo.compPhone || '';
            if (logoPreview && companyInfo.logoSrc) {
                logoPreview.src = companyInfo.logoSrc;
                logoPreview.style.display = 'block';
            }
            if (companyInfo.compName && document.getElementById('headerCompanyName')) {
                document.getElementById('headerCompanyName').textContent = companyInfo.compName + " Estimates & Invoices";
            }
        }
    }

    function renderCustomerDropdown(customers) {
        const customerSelect = document.getElementById('customerSelect');
        if (!customerSelect) return;
        customerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = '-- New Customer --';
        customerSelect.appendChild(defaultOption);
        customers.forEach((customer, idx) => {
            const option = document.createElement('option');
            let label = customer.custName + ' (' + customer.custPhone + ')';
            if (customer.custEmail) label += ' - ' + customer.custEmail;
            option.value = idx;
            option.text = label;
            customerSelect.appendChild(option);
        });
    }

    function renderCustomerList() {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customerList = document.getElementById('customerList');
        if (!customerList) return;
        customerList.innerHTML = '';
        customers.forEach((customer, idx) => {
            const li = document.createElement('li');
            let label = `${customer.custName} (${customer.custPhone}${customer.custEmail ? ', ' + customer.custEmail : ''})`;
            li.textContent = label;
            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.style.marginLeft = '10px';
            removeBtn.onclick = function () {
                customers.splice(idx, 1);
                localStorage.setItem('customers', JSON.stringify(customers));
                renderCustomerList();
                renderCustomerDropdown(customers);
            };
            li.appendChild(removeBtn);
            customerList.appendChild(li);
        });
    }

    function setupCustomerSearchAndDropdown() {
        let customers = JSON.parse(localStorage.getItem('customers') || '[]');
        renderCustomerDropdown(customers);
        renderCustomerList();

        const searchInput = document.getElementById('customerSearch');
        const customerSelect = document.getElementById('customerSelect');
        if (!searchInput || !customerSelect) return;
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const filtered = customers.filter(customer =>
                customer.custName.toLowerCase().includes(searchTerm) ||
                customer.custPhone.toLowerCase().includes(searchTerm) ||
                (customer.custEmail && customer.custEmail.toLowerCase().includes(searchTerm))
            );
            renderCustomerDropdown(filtered);
        });
        customerSelect.addEventListener('change', function () {
            let customers = JSON.parse(localStorage.getItem('customers') || '[]');
            const idx = customerSelect.value;
            if (idx !== '' && customers[idx]) {
                document.getElementById('custName').value = customers[idx].custName;
                document.getElementById('custPhone').value = customers[idx].custPhone;
                document.getElementById('custEmail').value = customers[idx].custEmail || '';
            } else {
                document.getElementById('custName').value = '';
                document.getElementById('custPhone').value = '';
                document.getElementById('custEmail').value = '';
            }
        });
    }
    setupCustomerSearchAndDropdown();

    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const custName = document.getElementById('custName').value;
            const custPhone = document.getElementById('custPhone').value;
            const custEmail = document.getElementById('custEmail').value;
            let customers = JSON.parse(localStorage.getItem('customers') || '[]');
            const exists = customers.some(
                customer => customer.custName === custName &&
                    customer.custPhone === custPhone &&
                    customer.custEmail === custEmail
            );
            if (!exists) {
                customers.push({ custName, custPhone, custEmail });
                localStorage.setItem('customers', JSON.stringify(customers));
                alert('Customer saved!');
                renderCustomerDropdown(customers);
                renderCustomerList();
            } else {
                alert('This customer is already saved.');
            }
        });
    }

    // --- Discounts ---
    function renderDiscountList() {
        const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
        const discountList = document.getElementById('discountList');
        if (!discountList) return;
        discountList.innerHTML = '';
        discounts.forEach((discount) => {
            let label =
                discount.type === 'percent'
                    ? `${discount.name}: ${discount.value}% off`
                    : `${discount.name}: $${discount.value.toFixed(2)} off`;
            const li = document.createElement('li');
            li.textContent = label;
            discountList.appendChild(li);
        });
    }
    renderDiscountList();
    const discountForm = document.getElementById('manageDiscountForm');
    if (discountForm) {
        discountForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const name = document.getElementById('discountName').value;
            const type = document.getElementById('discountType').value;
            const value = parseFloat(document.getElementById('discountValue').value) || 0;
            let discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
            discounts.push({ name, type, value });
            localStorage.setItem('discounts', JSON.stringify(discounts));
            renderDiscountList();
            refreshDiscountUI();
            discountForm.reset();
        });
    }

    // --- Manage Standard Services (with Remove button) ---
    const manageServiceForm = document.getElementById('manageServiceForm');
    function renderStdServiceList() {
        const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
        const stdServiceList = document.getElementById('stdServiceList');
        if (!stdServiceList) return;
        stdServiceList.innerHTML = '';
        stdServices.forEach((service, idx) => {
            const li = document.createElement('li');
            let priceStr = [];
            if (service.price && service.price > 0) priceStr.push(`$${service.price.toFixed(2)} per sq ft`);
            if (service.setPrice && service.setPrice > 0) priceStr.push(`$${service.setPrice.toFixed(2)} set price`);
            li.textContent = `${service.name}${priceStr.length ? ' | ' + priceStr.join(', ') : ''}`;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.style.marginLeft = '10px';
            removeBtn.onclick = function () {
                stdServices.splice(idx, 1);
                localStorage.setItem('stdServices', JSON.stringify(stdServices));
                renderStdServiceList();
                populateServiceDropdown();
            };
            li.appendChild(removeBtn);
            stdServiceList.appendChild(li);
        });
    }
    renderStdServiceList();
    if (manageServiceForm) {
        manageServiceForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const name = document.getElementById('stdServiceName').value;
            const setPrice = parseFloat(document.getElementById('stdServiceSetPrice').value) || 0;
            const price = parseFloat(document.getElementById('stdServicePrice').value) || 0;
            let stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
            stdServices.push({ name, setPrice, price });
            localStorage.setItem('stdServices', JSON.stringify(stdServices));
            renderStdServiceList();
            manageServiceForm.reset();
            populateServiceDropdown();
        });
    }

    // --- Service Form: Show/Hide Fields and Calculation ---
    function togglePriceFields() {
        const priceType = document.querySelector('input[name="priceType"]:checked').value;
        document.getElementById('areaGroup').style.display = priceType === 'perSqFt' ? '' : 'none';
        document.getElementById('setPriceGroup').style.display = priceType === 'setPrice' ? '' : 'none';
        updateServiceTotal();
    }
    document.querySelectorAll('input[name="priceType"]').forEach(radio => {
        radio.addEventListener('change', togglePriceFields);
    });
    togglePriceFields();

    function updateServiceTotal() {
        const priceType = document.querySelector('input[name="priceType"]:checked').value;
        let total = 0;
        if (priceType === 'perSqFt') {
            const area = parseFloat(document.getElementById('serviceArea').value) || 0;
            const pricePer = parseFloat(document.getElementById('servicePricePer').value) || 0;
            total = area * pricePer;
        } else {
            const setPrice = parseFloat(document.getElementById('serviceSetPrice').value) || 0;
            const quantity = parseInt(document.getElementById('serviceQuantity').value) || 1;
            total = setPrice * quantity;
        }
        document.getElementById('serviceTotal').value = total ? `$${total.toFixed(2)}` : '';
    }
    document.getElementById('serviceArea').addEventListener('input', updateServiceTotal);
    document.getElementById('servicePricePer').addEventListener('input', updateServiceTotal);
    document.getElementById('serviceSetPrice').addEventListener('input', updateServiceTotal);
    document.getElementById('serviceQuantity').addEventListener('input', updateServiceTotal);
    document.querySelectorAll('input[name="priceType"]').forEach(radio => {
        radio.addEventListener('change', updateServiceTotal);
    });

    // --- Invoice Services (Add & Render) ---
    function populateServiceDropdown() {
        const dropdown = document.getElementById('serviceDropdown');
        const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
        if (!dropdown) return;
        dropdown.innerHTML = '<option value="">Select a service</option>';
        stdServices.forEach((service, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.text = `${service.name} ($${service.price.toFixed(2)} per sq ft${service.setPrice && service.setPrice > 0 ? ', $' + service.setPrice.toFixed(2) + ' set' : ''})`;
            dropdown.appendChild(option);
        });
    }
    populateServiceDropdown();

    const serviceDropdown = document.getElementById('serviceDropdown');
    if (serviceDropdown) {
        serviceDropdown.addEventListener('change', function () {
            const idx = this.value;
            const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
            if (idx !== '' && stdServices[idx]) {
                document.getElementById('servicePricePer').value = stdServices[idx].price ? stdServices[idx].price.toFixed(2) : '';
                document.getElementById('serviceSetPrice').value = stdServices[idx].setPrice ? stdServices[idx].setPrice.toFixed(2) : '';
            } else {
                document.getElementById('servicePricePer').value = '';
                document.getElementById('serviceSetPrice').value = '';
            }
            updateServiceTotal && updateServiceTotal();
        });
    }

    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const dropdown = document.getElementById('serviceDropdown');
            const idx = dropdown.value;
            const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
            if (idx === '' || !stdServices[idx]) {
                alert('Please select a service.');
                return;
            }
            const desc = stdServices[idx].name;
            const priceType = document.querySelector('input[name="priceType"]:checked').value;
            let area = 0, pricePer = 0, setPrice = 0, quantity = 1, total = 0;
            if (priceType === 'perSqFt') {
                area = parseFloat(document.getElementById('serviceArea').value) || 0;
                pricePer = parseFloat(document.getElementById('servicePricePer').value) || 0;
                total = area * pricePer;
            } else {
                setPrice = parseFloat(document.getElementById('serviceSetPrice').value) || 0;
                quantity = parseInt(document.getElementById('serviceQuantity').value) || 1;
                total = setPrice * quantity;
            }
            const service = { desc, priceType, area, pricePer, setPrice, quantity, total };
            let services = JSON.parse(localStorage.getItem('services') || '[]');
            services.push(service);
            localStorage.setItem('services', JSON.stringify(services));
            renderServiceList();
            serviceForm.reset();
            document.getElementById('servicePricePer').value = '';
            document.getElementById('serviceSetPrice').value = '';
            document.getElementById('serviceQuantity').value = '1';
            togglePriceFields();
            updateServiceTotal();
        });
    }

    function renderServiceList() {
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const serviceList = document.getElementById('serviceList');
        if (!serviceList) return;
        serviceList.innerHTML = '';
        services.forEach((service, idx) => {
            const li = document.createElement('li');
            let priceDisplay;
            if (service.priceType === 'perSqFt') {
                priceDisplay = `${service.area} sq ft x $${(service.pricePer || 0).toFixed(2)} = $${(service.total || 0).toFixed(2)}`;
            } else {
                const qty = service.quantity !== undefined ? service.quantity : 1;
                const setPrice = service.setPrice !== undefined ? service.setPrice : 0;
                priceDisplay = `${qty} x $${setPrice.toFixed(2)} = $${(service.total || 0).toFixed(2)}`;
            }
            li.textContent = `${service.desc} | ${priceDisplay}`;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.style.marginLeft = '10px';
            removeBtn.onclick = function () {
                services.splice(idx, 1);
                localStorage.setItem('services', JSON.stringify(services));
                renderServiceList();
                if (typeof updateFinalTotal === 'function') updateFinalTotal();
            };
            li.appendChild(removeBtn);
            serviceList.appendChild(li);
        });
    }
    renderServiceList();

    // --- Discount Application ---
    function renderDiscountCheckboxes() {
        const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
        const container = document.getElementById('availableDiscounts');
        if (!container) return;
        container.innerHTML = '';
        const searchElem = document.getElementById('discountSearch');
        const searchStr = searchElem ? searchElem.value.toLowerCase() : '';
        const filtered = discounts.filter(d => d.name.toLowerCase().includes(searchStr));
        filtered.forEach((discount, idx) => {
            const label = document.createElement('label');
            label.style.marginRight = '1em';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = discounts.indexOf(discount);
            checkbox.className = 'discountCheckbox';
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(
                discount.type === 'percent'
                    ? `${discount.name} (${discount.value}% off)`
                    : `${discount.name} ($${discount.value.toFixed(2)} off)`
            ));
            container.appendChild(label);
        });
    }
    const discountSearch = document.getElementById('discountSearch');
    if (discountSearch) {
        discountSearch.addEventListener('input', renderDiscountCheckboxes);
    }
    const applyDiscountsForm = document.getElementById('applyDiscountsForm');
    if (applyDiscountsForm) {
        applyDiscountsForm.addEventListener('change', updateFinalTotal);
    }
    function updateFinalTotal() {
        let services = JSON.parse(localStorage.getItem('services') || '[]');
        let subtotal = services.reduce((sum, srv) => sum + srv.total, 0);
        const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
        const checked = Array.from(document.getElementsByClassName('discountCheckbox'))
            .filter(cb => cb.checked)
            .map(cb => discounts[parseInt(cb.value)]);
        checked.filter(d => d.type === 'percent').forEach(d => {
            subtotal -= subtotal * (d.value / 100);
        });
        checked.filter(d => d.type === 'dollar').forEach(d => {
            subtotal -= d.value;
        });
        const finalTotal = Math.max(0, subtotal);
        const finalTotalElem = document.getElementById('finalTotal');
        if (finalTotalElem) finalTotalElem.textContent = `$${finalTotal.toFixed(2)}`;
    }
    function refreshDiscountUI() {
        renderDiscountCheckboxes();
        updateFinalTotal();
    }
    renderDiscountCheckboxes();
    updateFinalTotal();

    // --- Universal Terms ---
    const universalTerms = `Apex Surfaces LLC – Service Terms and Conditions
Welcome to Apex Surfaces LLC. By scheduling, accepting, and authorizing exterior cleaning services from Apex Surfaces LLC, you (the "Client") agree to be bound by the following Terms and Conditions. This document constitutes a binding contract between Apex Surfaces LLC and the Client.

1. Scope of Work & Acceptance
* Authorization: The Client authorizes Apex Surfaces LLC to perform exterior cleaning services (which may include pressure washing, soft washing, surface cleaning, and chemical treatments) as outlined in the provided written estimate, proposal, or invoice.
* Agreement: Acceptance of a service estimate, approval of a digital proposal, scheduling a service date, or allowing work to begin constitutes full acceptance of these Terms and Conditions.

2. Client Responsibilities & Site Preparation
To ensure safety and optimal results, the Client agrees to complete the following preparations prior to our arrival:
* Water Access: The Client must provide Apex Surfaces LLC with access to a reliable, continuous on-site water supply (an outdoor spigot) with standard residential/commercial water pressure. If a water source is unavailable, shut off, or insufficient, this must be disclosed prior to scheduling.
* Property Preparation: All windows and doors must be tightly shut and secured.
* Clearance: All vehicles, outdoor furniture, decorations, inventory, potted plants, and personal property must be moved at least 20 feet away from the work area. Apex Surfaces LLC is not responsible for moving property and assumes no liability for items left in the work zone.
* Access & Lockouts: For off-hours or commercial overnight jobs, the Client must ensure all gates, utility closets, and water sources are unlocked. If our team arrives and is unable to work due to locked utilities, a $150 site-lockout/dry-run fee will apply.

3. Safety, Pedestrian Traffic & Site Control
* Bystander Safety: All pets, children, tenants, and unessential personnel must remain indoors for the entire duration of the service and until treated areas are fully dry.
* Commercial Traffic: While Apex Surfaces LLC will utilize standard safety cones and caution signs to mark active work zones, the Client is responsible for notifying employees, tenants, and customers to avoid the area. Apex Surfaces LLC assumes no liability for slips, trips, or chemical exposure to individuals who bypass safety barricades or walk through active work zones.

4. Pre-Existing Damage & Weathering
* Inspection: While Apex Surfaces LLC conducts a pre-work assessment, it is the Client’s responsibility to note and disclose any known property defects, structural weaknesses, loose siding, compromised window seals, or active water leaks.
* Exclusion of Liability: Apex Surfaces LLC is not liable for damages caused by pre-existing conditions, including but not limited to:
    * Wood rot, failing mortar, loose grout, or cracked stucco/siding/brick.
    * Water intrusion through improperly sealed windows, doors, expansion joints, or vents.
    * Oxidization, sun-fading, or inherent weathering of vinyl, wood, metal, or concrete that becomes more visible once dirt, mold, and algae are removed.
    * Flaking, spalling, or chipping of aged, improperly cured, unsealed, or low-quality concrete and concrete overlays.

5. Chemicals, Soft Washing, & Vegetation
* Chemical Use: Apex Surfaces LLC utilizes industry-standard cleaning solutions (including diluted sodium hypochlorite and surfactants) to effectively kill organic growth.
* Plant Safety: We take extensive precautions to protect surrounding landscaping, including pre-wetting and post-rinsing plants, grass, and shrubs. However, the Client acknowledges that minor, temporary cosmetic spots or temporary stress to highly sensitive flora can occasionally occur from overspray or runoff. Apex Surfaces LLC is not liable for landscape damage unless caused by gross negligence.

6. Scheduling & Weather Delays
* Exterior cleaning is highly dependent on weather conditions. Apex Surfaces LLC reserves the right to reschedule services due to heavy rain, high winds, lightning, freezing temperatures, or other hazardous conditions to ensure safety and quality.

7. Payment Terms & Commercial Net Billing
* Residential Accounts: Payment is due in full immediately upon completion of the service. We accept cash, check, or major credit/debit cards.
* Commercial Accounts: Unless otherwise negotiated and written into the contract, commercial accounts are subject to Net 30 days billing terms from the invoice date.
* Deposits: For projects exceeding $3,000, a non-refundable deposit of 30-50% is required prior to scheduling, with the remaining balance billed upon completion.
* Late Fees & Collections: Past-due invoices will be subject to a late fee of 1.5% per month (or the maximum allowed by law) on the remaining balance. The Client agrees to pay all collection costs, reasonable attorney fees, and court costs incurred by Apex Surfaces LLC in pursuing delinquent accounts.

8. Satisfaction, Claims, & Insurance
* Reporting Window: The Client is encouraged to inspect the work immediately upon completion. Any dissatisfaction, perceived deficiencies, or claims of damage must be reported to Apex Surfaces LLC in writing within 48 hours of service completion.
* Remediation: Apex Surfaces LLC must be given the first opportunity to inspect and remedy any valid service complaints or accidental damages before the Client hires a third-party contractor or attempts self-repair.
* Limitation of Liability: Apex Surfaces LLC maintains active Commercial General Liability insurance. Our liability for any property damage or operational claims is strictly limited to the limits of our insurance policy and shall not exceed the total dollar amount paid by the Client for the specific service rendered.

9. Marketing & Media Rights
* The Client grants Apex Surfaces LLC permission to take "before and after" photographs and videos of the property during the scope of work. These materials may be used for promotional, marketing, social media, and portfolio purposes. Apex Surfaces LLC agrees not to disclose sensitive personal information, such as street numbers or the Client's last name, in these marketing materials.

10. Governing Law
* These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of the State of Alabama. Any legal actions or disputes arising from our services shall be filed in the appropriate court closest to our primary place of business.
`;

    document.getElementById('generatePreview').addEventListener('click', function () {
        // Get info
        const companyInfo = JSON.parse(localStorage.getItem('companyInfo') || '{}');
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const customerName = document.getElementById('custName')?.value || '';
        const docType = document.getElementById('docType')?.value || 'Estimate';
        const dateVal = new Date().toLocaleDateString();
        const dueDateValue = document.getElementById('dueDate')?.value;
        const dueDateHtml = dueDateValue
            ? `<div><strong>Due Date:</strong> ${dueDateValue}</div>`
            : '';

        // Build logo/company info
        const logoHtml = companyInfo.logoSrc
            ? `<img src="${companyInfo.logoSrc}" style="max-width:60px; max-height:60px; vertical-align:middle; margin-right:12px;">`
            : '';
        const compNameHtml = `<span style="font-size:1.3em;font-weight:bold;vertical-align:middle;">${companyInfo.compName || ''}</span><br>`;
        const compInfoHtml = `${companyInfo.compPhone ? companyInfo.compPhone : ''}${companyInfo.compEmail ? ' | ' + companyInfo.compEmail : ''}`;

        // Build service rows
        const serviceRows = services.map(service => {
            if (service.priceType === 'perSqFt') {
                return `<tr><td>${service.desc}</td><td>${service.area} sq ft</td><td>$${(service.pricePer ?? 0).toFixed(2)}</td><td>$${(service.total ?? 0).toFixed(2)}</td></tr>`;
            } else {
                return `<tr><td>${service.desc}</td><td>${service.quantity || 1} units</td><td>$${(service.setPrice ?? 0).toFixed(2)}</td><td>$${(service.total ?? 0).toFixed(2)}</td></tr>`;
            }
        }).join('');
        // Subtotal (all services)
        const subtotal = services.reduce((sum, s) => sum + (s.total || 0), 0);

        // Discounts (checked in UI, like before)
        const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');
        const checkedDiscountCheckboxes = document.querySelectorAll('.discountCheckbox:checked');
        const appliedDiscounts = Array.from(checkedDiscountCheckboxes).map(cb => discounts[parseInt(cb.value)]);

        // Apply discounts step by step
        let runningTotal = subtotal; // This will become your final total
        let discountLines = [];
        appliedDiscounts.filter(d => d.type === 'percent').forEach(d => {
            const amt = runningTotal * (d.value / 100);
            runningTotal -= amt;
            discountLines.push(`<tr><td>${d.name} (${d.value}% off)</td><td style="text-align:right;">-$${amt.toFixed(2)}</td></tr>`);
        });
        appliedDiscounts.filter(d => d.type === 'dollar').forEach(d => {
            runningTotal -= d.value;
            discountLines.push(`<tr><td>${d.name} ($${d.value.toFixed(2)} off)</td><td style="text-align:right;">-$${d.value.toFixed(2)}</td></tr>`);
        });
        const finalTotal = Math.max(0, runningTotal);

        const totalLineHtml = `
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <tr>
        <td style="text-align:left;"><strong>Subtotal</strong></td>
        <td style="text-align:right;"><strong>$${subtotal.toFixed(2)}</strong></td>
      </tr>
      ${discountLines.join('')}
      <tr>
        <td style="text-align:left;"><strong>Total</strong></td>
        <td style="text-align:right;"><strong>$${finalTotal.toFixed(2)}</strong></td>
      </tr>
    </table>
`;

        // Use your existing universalTerms variable!
        const contractHtml = `<div style="margin-top:20px; border-top:1px solid #ddd; padding-top:12px;">
        <strong>Terms & Conditions:</strong><br>
        ${universalTerms.replace(/\n/g, "<br>")}
    </div>`;

        // Final preview HTML
        const previewHtml = `
        <div style="display:flex; align-items:center; margin-bottom:16px;">
            ${logoHtml}
            <div>
                ${compNameHtml}
                ${compInfoHtml}
            </div>
        </div>
        <h3>${docType}</h3>
        <div><strong>Date:</strong> ${dateVal}</div>
        ${dueDateHtml}
        <div><strong>Customer:</strong> ${customerName}</div>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <tr>
                <th>Service</th><th>Qty/Area</th><th>Rate</th><th>Total</th>
            </tr>
            ${serviceRows}
        </table>
        ${totalLineHtml}
        ${contractHtml}
    `;

        document.getElementById('invoicePreview').innerHTML = previewHtml;
    });

    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const preview = document.getElementById('invoicePreview');
            if (!preview) return;

            const originalMaxHeight = preview.style.maxHeight;
            const originalOverflow = preview.style.overflow;
            preview.style.maxHeight = 'none';
            preview.style.overflow = 'visible';

            html2canvas(preview, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF({
                    orientation: 'p',
                    unit: 'pt',
                    format: 'a4'
                });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pageWidth - 40;
                const imgHeight = canvas.height * (imgWidth / canvas.width);
                pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
                const customerName = document.getElementById('custName')?.value || 'Client';
                const safeName = customerName.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
                const todayStr = new Date().toISOString().slice(0, 10);
                const fileName = `Apex-${safeName}-${todayStr}.pdf`;
                pdf.save(fileName);
                preview.style.maxHeight = originalMaxHeight;
                preview.style.overflow = originalOverflow;
            });
        });
    }
});