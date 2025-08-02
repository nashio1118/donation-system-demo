// フォーム管理クラス
class DonationForm {
    constructor() {
        this.donorCount = 0;
        this.donorsContainer = document.getElementById('donorsContainer');
        this.addDonorBtn = document.getElementById('addDonorBtn');
        this.form = document.getElementById('donationForm');
        this.basicInfo = null;
        
        this.initializeEventListeners();
        this.loadBasicInfo();
        this.addInitialDonors(); // デフォルトで5名追加
    }

    initializeEventListeners() {
        this.addDonorBtn.addEventListener('click', () => this.addDonorRow());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // 1ページ目のデータを読み込み
    loadBasicInfo() {
        const basicInfoData = localStorage.getItem('basicInfo');
        if (basicInfoData) {
            this.basicInfo = JSON.parse(basicInfoData);
            this.displayBasicInfo();
        }
    }

    // 基本情報を表示
    displayBasicInfo() {
        if (!this.basicInfo) return;

        // ヘッダーに基本情報を追加
        const header = document.querySelector('header');
        const infoDiv = document.createElement('div');
        infoDiv.className = 'mt-4 p-4 bg-blue-50 rounded-lg';
        infoDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>名前:</strong> ${this.basicInfo.basicInfo.name}</div>
                <div><strong>学年:</strong> ${this.basicInfo.basicInfo.grade}</div>
                <div><strong>振込日:</strong> ${this.basicInfo.basicInfo.transferDate}</div>
            </div>
            <div class="mt-2 p-2 bg-white rounded border">
                <strong>1ページ目の寄付金:</strong> ¥${this.basicInfo.breakdownDetails.donationAmount.toLocaleString()}
            </div>
        `;
        header.appendChild(infoDiv);
    }

    // 寄付者行を追加
    addDonorRow() {
        this.donorCount++;
        const donorRow = this.createDonorRow(this.donorCount);
        this.donorsContainer.appendChild(donorRow);
        this.updateTotals();
    }

    // 寄付者行を削除
    removeDonorRow(button) {
        const donorRow = button.closest('.donor-row');
        donorRow.remove();
        this.updateTotals();
    }

    // デフォルトで5名追加
    addInitialDonors() {
        for (let i = 0; i < 5; i++) {
            this.addDonorRow();
        }
    }

    // 寄付者行のHTMLを生成
    createDonorRow(index) {
        const row = document.createElement('div');
        row.className = 'donor-row bg-gray-50 rounded-lg p-4 mb-4 border';
        row.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-medium text-gray-800">寄付者 ${index}</h3>
                <button type="button" class="remove-donor-btn text-red-500 hover:text-red-700 text-sm font-medium">
                    削除
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">御芳名 *</label>
                    <input type="text" name="donorName_${index}" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
                    <select name="donorAmountType_${index}" class="donor-amount-type w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">金額を選択</option>
                        <option value="10000">¥10,000</option>
                        <option value="5000">¥5,000</option>
                        <option value="other">その他</option>
                    </select>
                </div>
                <div class="donor-amount-input hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-1">金額入力</label>
                    <input type="number" name="donorAmountCustom_${index}" min="0" step="100"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="金額を入力">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">返礼品</label>
                    <select name="donorGift_${index}" class="donor-gift w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">返礼品なし</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <input type="text" name="donorNote_${index}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="特になし">
                </div>
            </div>
        `;

        // 削除ボタンのイベントリスナーを追加
        const removeBtn = row.querySelector('.remove-donor-btn');
        removeBtn.addEventListener('click', () => this.removeDonorRow(removeBtn));

        // 金額選択のイベントリスナーを追加
        const amountTypeSelect = row.querySelector('.donor-amount-type');
        const amountInput = row.querySelector('.donor-amount-input');
        const giftSelect = row.querySelector('.donor-gift');

        amountTypeSelect.addEventListener('change', () => {
            this.handleAmountTypeChange(amountTypeSelect, amountInput, giftSelect);
        });

        // その他の金額入力フィールドのイベントリスナーを追加
        const customAmountInput = amountInput.querySelector('input');
        if (customAmountInput) {
            customAmountInput.addEventListener('input', () => {
                this.updateTotals();
            });
        }

        return row;
    }

    // 金額タイプ変更時の処理
    handleAmountTypeChange(amountTypeSelect, amountInput, giftSelect) {
        const selectedValue = amountTypeSelect.value;
        
        if (selectedValue === 'other') {
            amountInput.classList.remove('hidden');
            // その他の場合は金額入力フィールドの変更を監視
            const customInput = amountInput.querySelector('input');
            customInput.addEventListener('input', () => {
                const customAmount = parseInt(customInput.value) || 0;
                this.updateGiftOptions(giftSelect, customAmount);
                this.updateTotals(); // 合計金額も更新
            });
        } else if (selectedValue === '10000') {
            amountInput.classList.add('hidden');
            this.updateGiftOptions(giftSelect, 10000);
        } else if (selectedValue === '5000') {
            amountInput.classList.add('hidden');
            this.updateGiftOptions(giftSelect, 5000);
        } else {
            amountInput.classList.add('hidden');
            giftSelect.innerHTML = '<option value="">返礼品なし</option>';
        }
        
        this.updateTotals();
    }

    // 返礼品オプションを更新（下の階級も含めて全て表示）
    updateGiftOptions(giftSelect, amount) {
        giftSelect.innerHTML = '<option value="">返礼品なし</option>';
        
        // 10000円以上の場合
        if (amount >= 10000) {
            giftSelect.innerHTML += `
                <option value="towel">タオル</option>
                <option value="sweets">お菓子</option>
                <option value="clearfile_50">クリアファイル50枚(団体様)</option>
                <option value="keychain">キーホルダー</option>
                <option value="clearfile_25">クリアファイル25枚(団体様)</option>
                <option value="clearfile">クリアファイル</option>
            `;
        } 
        // 5000円以上の場合
        else if (amount >= 5000) {
            giftSelect.innerHTML += `
                <option value="keychain">キーホルダー</option>
                <option value="sweets">お菓子</option>
                <option value="clearfile_25">クリアファイル25枚(団体様)</option>
                <option value="clearfile">クリアファイル</option>
            `;
        } 
        // 5000円未満の場合
        else if (amount > 0) {
            giftSelect.innerHTML += `
                <option value="clearfile">クリアファイル</option>
            `;
        }
    }

    // 合計を更新
    updateTotals() {
        const calculator = new DonationCalculator();
        const totals = calculator.calculateTotals();
        
        document.getElementById('totalDonors').textContent = totals.donorCount;
        document.getElementById('totalAmount').textContent = `¥${totals.totalAmount.toLocaleString()}`;
        document.getElementById('totalGifts').textContent = totals.giftCount;

        // 1ページ目の寄付金と照合
        this.validateDonationAmount(totals.totalAmount);
    }

    // 1ページ目の寄付金と照合
    validateDonationAmount(page2Total) {
        if (!this.basicInfo) return;

        const page1Donation = this.basicInfo.breakdownDetails.donationAmount;
        
        if (page1Donation > 0 && page2Total !== page1Donation) {
            // 警告を表示
            const warningDiv = document.getElementById('amount-warning') || this.createWarningDiv();
            warningDiv.innerHTML = `
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                                <strong>金額の不一致:</strong> 1ページ目の寄付金（¥${page1Donation.toLocaleString()}）と2ページ目の合計金額（¥${page2Total.toLocaleString()}）が一致しません。
                            </p>
                        </div>
                    </div>
                </div>
            `;
            warningDiv.style.display = 'block';
        } else {
            const warningDiv = document.getElementById('amount-warning');
            if (warningDiv) {
                warningDiv.style.display = 'none';
            }
        }
    }

    // 警告表示用のdivを作成
    createWarningDiv() {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'amount-warning';
        const form = document.getElementById('donationForm');
        form.insertBefore(warningDiv, form.firstChild);
        return warningDiv;
    }

    // フォーム送信処理
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            alert('必須項目を入力してください。');
            return;
        }

        if (!this.validateAmounts()) {
            alert('金額の照合に失敗しました。1ページ目の寄付金と2ページ目の合計金額を確認してください。');
            return;
        }

        const formData = this.collectFormData();
        
        try {
            this.showLoading(true);
            await this.submitToGoogleSheets(formData);
            this.showSuccess();
            this.resetForm();
        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信中にエラーが発生しました。もう一度お試しください。');
        } finally {
            this.showLoading(false);
        }
    }

    // フォームバリデーション
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                return false;
            }
        }
        return true;
    }

    // 金額照合の検証
    validateAmounts() {
        if (!this.basicInfo) return true;

        const calculator = new DonationCalculator();
        const totals = calculator.calculateTotals();
        const page1Donation = this.basicInfo.breakdownDetails.donationAmount;

        // 1ページ目の寄付金が0の場合は照合しない
        if (page1Donation === 0) {
            return true;
        }

        return totals.totalAmount === page1Donation;
    }

    // フォームデータを収集
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {
            basicInfo: this.basicInfo,
            submissionDate: new Date().toISOString(),
            donors: []
        };

        // 寄付者情報を収集
        const donorRows = document.querySelectorAll('.donor-row');
        donorRows.forEach((row, index) => {
            const name = formData.get(`donorName_${index + 1}`);
            const amountType = formData.get(`donorAmountType_${index + 1}`);
            const amountCustom = formData.get(`donorAmountCustom_${index + 1}`);
            const gift = formData.get(`donorGift_${index + 1}`);
            const note = formData.get(`donorNote_${index + 1}`);

            // 金額を計算
            let amount = 0;
            if (amountType === '10000') {
                amount = 10000;
            } else if (amountType === '5000') {
                amount = 5000;
            } else if (amountType === 'other' && amountCustom) {
                amount = parseInt(amountCustom) || 0;
            }

            const donorData = {
                name: name,
                amount: amount,
                gift: gift,
                note: note
            };
            data.donors.push(donorData);
        });

        return data;
    }

    // Google Sheetsに送信
    async submitToGoogleSheets(data) {
        // Google Apps Scriptのエンドポイントに送信
        const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('送信に失敗しました');
        }

        return await response.json();
    }

    // ローディング表示
    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.classList.toggle('hidden', !show);
    }

    // 成功メッセージ
    showSuccess() {
        alert('奉加帳を正常に送信しました。ありがとうございます。');
        // ローカルストレージをクリア
        localStorage.removeItem('basicInfo');
    }

    // フォームをリセット
    resetForm() {
        this.form.reset();
        this.donorsContainer.innerHTML = '';
        this.donorCount = 0;
        this.addInitialDonors();
        this.updateTotals();
    }
}

// フォームを初期化
document.addEventListener('DOMContentLoaded', () => {
    new DonationForm();
}); 