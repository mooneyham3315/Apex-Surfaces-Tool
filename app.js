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

    // --- Customer Save ---
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const custName = document.getElementById('custName').value;
            const custPhone = document.getElementById('custPhone').value;
            const custEmail = document.getElementById('custEmail').value; // email is optional

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
            } else {
                alert('This customer is already saved.');
            }
        });
    }

    // --- Render and Live Search for Customers ---
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
    function setupCustomerSearchAndDropdown() {
        let customers = JSON.parse(localStorage.getItem('customers') || '[]');
        renderCustomerDropdown(customers);
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

    // --- Discounts ---
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

    const manageServiceForm = document.getElementById('manageServiceForm');
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

    function renderStdServiceList() {
        const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
        const stdServiceList = document.getElementById('stdServiceList');
        if (!stdServiceList) return;
        stdServiceList.innerHTML = '';
        stdServices.forEach((service) => {
            const li = document.createElement('li');
            li.textContent = `${service.name} | $${service.price.toFixed(2)} per sq ft`;
            stdServiceList.appendChild(li);
        });
    }
    renderStdServiceList();

    // --- Add Service to Invoice ---
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const dropdown = document.getElementById('serviceDropdown');
            const idx = dropdown.value;
            const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
            const area = parseFloat(document.getElementById('serviceArea').value) || 0;
            if (idx === '' || !stdServices[idx]) {
                alert('Please select a service.');
                return;
            }
            const desc = stdServices[idx].name;
            const pricePer = parseFloat(document.getElementById('servicePricePer').value) || 0;
            const total = area * pricePer;
            const service = { desc, area, pricePer, total };
            let services = JSON.parse(localStorage.getItem('services') || '[]');
            services.push(service);
            localStorage.setItem('services', JSON.stringify(services));
            renderServiceList();
            serviceForm.reset();
            if (typeof updateServiceTotal === 'function') updateServiceTotal();
        });
    }
    function renderServiceList() {
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const serviceList = document.getElementById('serviceList');
        if (!serviceList) return;
        serviceList.innerHTML = '';
        services.forEach((service, idx) => {
            const li = document.createElement('li');
            li.textContent = `${service.desc} | ${service.area} sq ft x $${service.pricePer.toFixed(2)} = $${service.total.toFixed(2)}`;
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

    function populateServiceDropdown() {
        const dropdown = document.getElementById('serviceDropdown');
        const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
        if (!dropdown) return;
        dropdown.innerHTML = '<option value="">Select a service</option>';
        stdServices.forEach((service, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.text = `${service.name} ($${service.price.toFixed(2)} per sq ft)`;
            dropdown.appendChild(option);
        });
    }
    populateServiceDropdown();

    // --- Price per sq ft autofill for service form ---
    const serviceDropdown = document.getElementById('serviceDropdown');
    if (serviceDropdown) {
        serviceDropdown.addEventListener('change', function () {
            const idx = this.value;
            const stdServices = JSON.parse(localStorage.getItem('stdServices') || '[]');
            const priceInput = document.getElementById('servicePricePer');
            if (idx !== '' && stdServices[idx]) {
                priceInput.value = stdServices[idx].price.toFixed(2);
            } else {
                priceInput.value = '';
            }
            if (typeof updateServiceTotal === 'function') updateServiceTotal();
        });
    }
    const serviceAreaInput = document.getElementById('serviceArea');
    const servicePricePerInput = document.getElementById('servicePricePer');
    if (serviceAreaInput) serviceAreaInput.addEventListener('input', updateServiceTotal);
    if (servicePricePerInput) servicePricePerInput.addEventListener('input', updateServiceTotal);
    function updateServiceTotal() {
        const area = parseFloat(document.getElementById('serviceArea').value) || 0;
        const pricePer = parseFloat(document.getElementById('servicePricePer').value) || 0;
        const total = area * pricePer;
        const totalInput = document.getElementById('serviceTotal');
        if (totalInput) totalInput.value = total ? `$${total.toFixed(2)}` : '';
    }

    // --- Discounts Live Search and Apply ---
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

    const universalTerms =
        `Apex Surfaces LLC – Service Terms and Conditions
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

    const termsInput = document.getElementById('terms');
    if (termsInput && !termsInput.value) {
        termsInput.value = defaultTerms;
    }


    document.getElementById('generatePreview').addEventListener('click', function () {
        // Get type and # info
        const docType = document.getElementById('docType').value || 'Estimate';
        let docPrefix = docType === 'Invoice' ? 'INV-' : 'EST-';
        let numKey = docType === 'Invoice' ? 'lastInvoiceNum' : 'lastEstimateNum';

        let lastNum = parseInt(localStorage.getItem(numKey)) || 1001;
        const newNum = lastNum + 1;
        localStorage.setItem(numKey, newNum);

        const docTypeHtml = `<div style="font-size:1.2em;font-weight:bold;margin-bottom:8px;">${docType}</div>`;
        const docNumHtml = `<div style="font-weight:bold;">${docPrefix}${newNum}</div>`;
        const jobType = document.getElementById('jobType').value || 'Residential';
        const jobTypeHtml = `<div><strong>Job Type:</strong> ${jobType}</div>`;
        const companyInfo = JSON.parse(localStorage.getItem('companyInfo') || '{}');
        const notesValue = document.getElementById('notes').value;
        const notesHtml = notesValue
            ? `<div style="margin-top:16px;"><strong>Notes:</strong><br>${notesValue.replace(/\n/g, "<br>")}</div>`
            : '';
        const today = new Date();
        const formattedDate = today.toLocaleDateString();
        const dateHtml = `<div><strong>Date:</strong> ${formattedDate}</div>`;
        const dueDateValue = document.getElementById('dueDate').value;
        const dueDateHtml = dueDateValue
            ? `<div><strong>Due Date:</strong> ${dueDateValue}</div>`
            : '';
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customer = customers.length > 0
            ? customers[customers.length - 1] // Last used customer; you may want to let user pick!
            : {};
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const discounts = JSON.parse(localStorage.getItem('discounts') || '[]');

        // Get all checked discount indexes
        const checkedDiscountCheckboxes = document.querySelectorAll('.discountCheckbox:checked');
        const appliedDiscounts = Array.from(checkedDiscountCheckboxes).map(cb => discounts[parseInt(cb.value)]);

        // Subtotal
        let subtotal = services.reduce((sum, srv) => sum + srv.total, 0);
        let discountLines = [];
        // Apply percent discounts
        appliedDiscounts.filter(d => d.type === 'percent').forEach(d => {
            const amt = subtotal * (d.value / 100);
            subtotal -= amt;
            discountLines.push(`<tr><td>${d.name} (${d.value}% off)</td><td>-$${amt.toFixed(2)}</td></tr>`);
        });
        // Apply dollar discounts
        appliedDiscounts.filter(d => d.type === 'dollar').forEach(d => {
            subtotal -= d.value;
            discountLines.push(`<tr><td>${d.name} ($${d.value.toFixed(2)} off)</td><td>-$${d.value.toFixed(2)}</td></tr>`);
        });
        subtotal = Math.max(0, subtotal);

        // Build company/logo info row
        const logoHtml = companyInfo.logoSrc
            ? `<img src="${companyInfo.logoSrc}" style="max-width:60px; max-height:60px; vertical-align:middle; margin-right:12px;">`
            : '';
        const compNameHtml = `<span style="font-size:1.3em;font-weight:bold;vertical-align:middle;">${companyInfo.compName || ''}</span>`;
        const compInfoHtml = `${companyInfo.compPhone ? `<div>Phone: ${companyInfo.compPhone}</div>` : ''}${companyInfo.compEmail ? `<div>Email: ${companyInfo.compEmail}</div>` : ''}`;

        // Services rows
        const serviceRows = services.map(s =>
            `<tr>
      <td>${s.desc}</td>
      <td>${s.area} sq ft</td>
      <td>$${s.pricePer.toFixed(2)}</td>
      <td>$${s.total.toFixed(2)}</td>
    </tr>`).join('');

        // Customer info
        const customerHtml = customer
            ? `<div>
        <strong>Customer:</strong> ${customer.custName || ''} ${customer.custPhone ? `| ${customer.custPhone}` : ''} ${customer.custEmail ? `| ${customer.custEmail}` : ''}
      </div>`
            : '<div><strong>No customer selected</strong></div>';

        const contractHtml = `<div style="margin-top:16px; border-top:1px solid #eee; padding-top:8px;">
        <strong>Terms & Conditions:</strong><br>
        ${universalTerms.replace(/\n/g, "<br>")}
        </div>`;

        const footerHtml = `<div style="margin-top:32px; text-align:center; color:#888; font-size:0.9em;">
    Thank you for choosing Apex Surfaces!
    </div>`;

        // Complete preview HTML
        const previewHtml = `
    <div style="display:flex; align-items:center; margin-bottom:12px;">
      ${logoHtml}
      <div>
        ${compNameHtml}
        ${compInfoHtml}
      </div>
    </div>
    ${docTypeHtml}
    ${docNumHtml}
    ${jobTypeHtml}
    ${dateHtml}
    ${dueDateHtml}
    ${customerHtml}
    
    <table style="width:100%;border-collapse:collapse; margin-top:12px;">
      <tr>
        <th style="text-align:left;">Service</th>
        <th style="text-align:right;">Area</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Total</th>
      </tr>
      ${serviceRows}
    </table>
    <table style="width:100%;border-collapse:collapse; margin-top:8px;">
      <tr>
        <td>Subtotal</td>
        <td style="text-align:right;">$${services.reduce((sum, srv) => sum + srv.total, 0).toFixed(2)}</td>
      </tr>
      ${discountLines.join('')}
      <tr>
        <td><strong>Total</strong></td>
        <td style="text-align:right;"><strong>$${subtotal.toFixed(2)}</strong></td>
      </tr>
    </table>
    ${contractHtml}
    ${notesHtml}
    ${footerHtml}
  `;

        document.getElementById('invoicePreview').innerHTML = previewHtml;

    });

    // Now, OUTSIDE the function above, add the PDF handler:
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const preview = document.getElementById('invoicePreview');
            if (!preview) return;

            // --- Make preview fully visible for PDF ---
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

                // --- Restore preview style ---
                preview.style.maxHeight = originalMaxHeight;
                preview.style.overflow = originalOverflow;
            });
        });
    }

    // now your DOMContentLoaded block closes:
});