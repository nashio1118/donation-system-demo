// デモ用の設定と機能
class DemoManager {
    constructor() {
        this.isDemo = true;
        this.demoData = [];
        this.initializeDemo();
    }

    // デモ用の初期化
    initializeDemo() {
        console.log('デモモードで動作しています');
        this.setupDemoFeatures();
    }

    // デモ用の機能設定
    setupDemoFeatures() {
        // 送信ボタンの動作を変更
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDemoSubmit();
            });
        });

        // フォームの送信を防止
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDemoSubmit();
            });
        });
    }

    // デモ用の送信処理
    handleDemoSubmit() {
        // デモ用の成功メッセージを表示
        this.showDemoMessage();
        
        // データをローカルに保存（デモ用）
        this.saveDemoData();
    }

    // デモ用のメッセージ表示
    showDemoMessage() {
        const message = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                    <div class="text-center">
                        <div class="text-4xl mb-4">🎉</div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">デモ版 - 送信完了</h3>
                        <p class="text-gray-600 mb-4">
                            実際のシステムでは、データがGoogleスプレッドシートに保存されます。
                        </p>
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h4 class="font-semibold text-blue-800 mb-2">デモ版の特徴</h4>
                            <ul class="text-sm text-blue-700 space-y-1">
                                <li>• リアルタイム計算機能</li>
                                <li>• 複数人まとめて入力</li>
                                <li>• 自動金額照合</li>
                                <li>• 返礼品自動提案</li>
                                <li>• スマホ最適化</li>
                            </ul>
                        </div>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', message);
    }

    // デモ用のデータ保存
    saveDemoData() {
        const formData = this.collectFormData();
        this.demoData.push({
            timestamp: new Date().toISOString(),
            data: formData
        });
        
        // ローカルストレージに保存（デモ用）
        localStorage.setItem('demoData', JSON.stringify(this.demoData));
        console.log('デモデータを保存しました:', formData);
    }

    // フォームデータの収集
    collectFormData() {
        const form = document.querySelector('form');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // デモデータの表示
    showDemoData() {
        const data = localStorage.getItem('demoData');
        if (data) {
            const demoData = JSON.parse(data);
            console.log('保存されたデモデータ:', demoData);
        }
    }
}

// デモ用の計算機クラス
class DemoCalculator {
    constructor() {
        this.giftRules = {
            sticker: { minAmount: 1000, name: 'ステッカー', description: 'チームロゴ入りステッカー' },
            towel: { minAmount: 3000, name: 'タオル', description: 'チームカラータオル' },
            't-shirt': { minAmount: 5000, name: 'Tシャツ', description: 'チームロゴTシャツ' },
            hoodie: { minAmount: 10000, name: 'フーディー', description: 'チームロゴフーディー' }
        };
    }

    // 返礼品の提案
    suggestGift(amount) {
        const suggestions = [];
        Object.entries(this.giftRules).forEach(([key, rule]) => {
            if (amount >= rule.minAmount) {
                suggestions.push({
                    key: key,
                    name: rule.name,
                    description: rule.description,
                    minAmount: rule.minAmount
                });
            }
        });
        return suggestions.sort((a, b) => b.minAmount - a.minAmount);
    }

    // 合計金額の計算
    calculateTotal(amounts) {
        return amounts.reduce((sum, amount) => sum + (parseInt(amount) || 0), 0);
    }
}

// デモ用のフォーム管理クラス
class DemoFormManager {
    constructor() {
        this.calculator = new DemoCalculator();
        this.setupFormHandlers();
    }

    // フォームハンドラーの設定
    setupFormHandlers() {
        // 金額入力時のリアルタイム計算
        const amountInputs = document.querySelectorAll('input[type="number"]');
        amountInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateCalculations();
            });
        });

        // 寄付者追加ボタン
        const addDonorBtn = document.getElementById('addDonorBtn');
        if (addDonorBtn) {
            addDonorBtn.addEventListener('click', () => {
                this.addDonorRow();
            });
        }
    }

    // 計算の更新
    updateCalculations() {
        // 合計金額の更新
        this.updateTotalAmount();
        
        // 返礼品の更新
        this.updateGiftSuggestions();
    }

    // 合計金額の更新
    updateTotalAmount() {
        const amountInputs = document.querySelectorAll('.donor-amount');
        const amounts = Array.from(amountInputs).map(input => input.value);
        const total = this.calculator.calculateTotal(amounts);
        
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = `¥${total.toLocaleString()}`;
        }
    }

    // 返礼品提案の更新
    updateGiftSuggestions() {
        const amountInputs = document.querySelectorAll('.donor-amount');
        amountInputs.forEach((input, index) => {
            const amount = parseInt(input.value) || 0;
            const suggestions = this.calculator.suggestGift(amount);
            
            const giftSelect = input.closest('.donor-row').querySelector('.donor-gift');
            if (giftSelect) {
                this.updateGiftOptions(giftSelect, suggestions);
            }
        });
    }

    // 返礼品オプションの更新
    updateGiftOptions(select, suggestions) {
        // 既存のオプションをクリア（最初の「返礼品なし」は保持）
        const noGiftOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (noGiftOption) {
            select.appendChild(noGiftOption);
        }

        // 新しい返礼品オプションを追加
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion.key;
            option.textContent = `${suggestion.name}（¥${suggestion.minAmount.toLocaleString()}以上）`;
            select.appendChild(option);
        });
    }

    // 寄付者行の追加
    addDonorRow() {
        const container = document.getElementById('donorsContainer');
        if (!container) return;

        const donorCount = container.children.length + 1;
        const newRow = this.createDonorRow(donorCount);
        container.appendChild(newRow);
        
        // 計算を更新
        this.updateCalculations();
    }

    // 寄付者行の作成
    createDonorRow(index) {
        const row = document.createElement('div');
        row.className = 'donor-row grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg';
        row.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">寄付者${index} *</label>
                <input type="text" name="donor${index}" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="寄付者名">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
                <input type="number" name="amount${index}" min="100" step="100" required
                       class="donor-amount w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="0">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">返礼品</label>
                <select name="gift${index}" class="donor-gift w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">返礼品なし</option>
                </select>
            </div>
            <div class="flex items-end">
                <button type="button" onclick="this.closest('.donor-row').remove(); updateCalculations();"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm">
                    削除
                </button>
            </div>
        `;
        return row;
    }
}

// デモ用の初期化
document.addEventListener('DOMContentLoaded', function() {
    window.demoManager = new DemoManager();
    window.demoFormManager = new DemoFormManager();
    
    // グローバル関数として公開
    window.updateCalculations = function() {
        if (window.demoFormManager) {
            window.demoFormManager.updateCalculations();
        }
    };
}); 
