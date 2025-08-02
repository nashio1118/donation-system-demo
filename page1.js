// 1ページ目フォーム管理クラス
class BasicInfoForm {
    constructor() {
        this.form = document.getElementById('basicInfoForm');
        this.initializeEventListeners();
        this.setDefaultDate();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 内訳計算のためのイベントリスナー
        const inputs = ['donationAmount', 'burdenFee', 'tshirtAmount', 'hasEncouragementFee', 'transferAmount', 'directTransferAmount'];
        inputs.forEach(inputName => {
            const elements = this.form.querySelectorAll(`[name="${inputName}"]`);
            elements.forEach(element => {
                element.addEventListener('change', () => this.updateBreakdown());
                element.addEventListener('input', () => this.updateBreakdown());
            });
        });
    }

    // デフォルト日付を設定（今日）
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('transferDate');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    // 内訳合計を更新
    updateBreakdown() {
        const donationAmount = parseInt(document.getElementById('donationAmount').value) || 0;
        const burdenFee = parseInt(document.querySelector('input[name="burdenFee"]:checked')?.value) || 0;
        const tshirtAmount = parseInt(document.getElementById('tshirtAmount').value) || 0;
        const hasEncouragementFee = document.querySelector('input[name="hasEncouragementFee"]').checked;

        // 各項目の金額を計算
        const burdenFeeAmount = burdenFee * 40000;
        const encouragementAmount = hasEncouragementFee ? 1000 : 0; // 奨励会負担金を1000円

        const total = donationAmount + burdenFeeAmount + tshirtAmount + encouragementAmount;

        // 合計を表示
        document.getElementById('totalBreakdown').textContent = `¥${total.toLocaleString()}`;

        // 振込金額と照合
        this.validateTransferAmount(total);
    }

    // 振込金額との照合
    validateTransferAmount(breakdownTotal) {
        const transferAmount = parseInt(document.getElementById('transferAmount').value) || 0;
        const directTransferAmount = parseInt(document.getElementById('directTransferAmount').value) || 0;
        const totalTransferAmount = transferAmount + directTransferAmount;
        
        if (totalTransferAmount > 0 && breakdownTotal !== totalTransferAmount) {
            // 警告を表示
            const warningDiv = document.getElementById('transfer-warning') || this.createTransferWarningDiv();
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
                                <strong>金額の不一致:</strong> 内訳合計（¥${breakdownTotal.toLocaleString()}）と振込金額合計（¥${totalTransferAmount.toLocaleString()}）が一致しません。
                            </p>
                            <p class="text-xs text-yellow-600 mt-1">
                                振込金額: ¥${transferAmount.toLocaleString()} + 直接振込金額: ¥${directTransferAmount.toLocaleString()} = ¥${totalTransferAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            warningDiv.style.display = 'block';
        } else {
            const warningDiv = document.getElementById('transfer-warning');
            if (warningDiv) {
                warningDiv.style.display = 'none';
            }
        }
    }

    // 振込金額警告表示用のdivを作成
    createTransferWarningDiv() {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'transfer-warning';
        const form = document.getElementById('basicInfoForm');
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
            alert('金額の照合に失敗しました。内訳合計と振込金額合計（振込金額＋直接振込金額）を確認してください。');
            return;
        }

        const formData = this.collectFormData();
        
        try {
            this.showLoading(true);
            
            // データをローカルストレージに保存
            localStorage.setItem('basicInfo', JSON.stringify(formData));
            
            // 2ページ目に遷移
            window.location.href = 'page2.html';
            
        } catch (error) {
            console.error('処理エラー:', error);
            alert('処理中にエラーが発生しました。もう一度お試しください。');
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
        const transferAmount = parseInt(document.getElementById('transferAmount').value) || 0;
        const directTransferAmount = parseInt(document.getElementById('directTransferAmount').value) || 0;
        const totalTransferAmount = transferAmount + directTransferAmount;
        
        const donationAmount = parseInt(document.getElementById('donationAmount').value) || 0;
        const burdenFee = parseInt(document.querySelector('input[name="burdenFee"]:checked')?.value) || 0;
        const tshirtAmount = parseInt(document.getElementById('tshirtAmount').value) || 0;
        const hasEncouragementFee = document.querySelector('input[name="hasEncouragementFee"]').checked;

        const burdenFeeAmount = burdenFee * 40000;
        const encouragementAmount = hasEncouragementFee ? 1000 : 0;

        const breakdownTotal = donationAmount + burdenFeeAmount + tshirtAmount + encouragementAmount;

        // 振込金額合計が0の場合は照合しない
        if (totalTransferAmount === 0) {
            return true;
        }

        return breakdownTotal === totalTransferAmount;
    }

    // フォームデータを収集
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {
            basicInfo: {
                grade: formData.get('grade'),
                name: formData.get('name'),
                hasSibling: formData.get('hasSibling') === 'on',
                transferDate: formData.get('transferDate'),
                transferAmount: parseInt(formData.get('transferAmount')) || 0,
                directTransferAmount: parseInt(formData.get('directTransferAmount')) || 0
            },
            breakdown: {
                donationAmount: parseInt(formData.get('donationAmount')) || 0,
                burdenFee: parseInt(formData.get('burdenFee')) || 0,
                tshirtAmount: parseInt(formData.get('tshirtAmount')) || 0,
                hasEncouragementFee: formData.get('hasEncouragementFee') === 'on'
            },
            submissionDate: new Date().toISOString()
        };

        // 内訳の詳細計算
        const burdenFeeAmount = data.breakdown.burdenFee * 40000;
        const encouragementAmount = data.breakdown.hasEncouragementFee ? 1000 : 0;

        data.breakdownDetails = {
            donationAmount: data.breakdown.donationAmount,
            burdenFeeAmount: burdenFeeAmount,
            tshirtAmount: data.breakdown.tshirtAmount,
            encouragementAmount: encouragementAmount,
            total: data.breakdown.donationAmount + burdenFeeAmount + data.breakdown.tshirtAmount + encouragementAmount
        };

        return data;
    }

    // ローディング表示
    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.classList.toggle('hidden', !show);
    }
}

// フォームを初期化
document.addEventListener('DOMContentLoaded', () => {
    new BasicInfoForm();
}); 