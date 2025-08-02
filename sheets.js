// Google Sheets連携クラス
class GoogleSheetsManager {
    constructor() {
        this.config = {
            // Google Apps ScriptのWebアプリURL（デプロイ後に設定）
            scriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
            // 設定スプレッドシートID
            configSheetId: 'YOUR_CONFIG_SHEET_ID',
            // データ保存用スプレッドシートID
            dataSheetId: 'YOUR_DATA_SHEET_ID'
        };
        
        this.settings = null;
        this.initializeSettings();
    }

    // 設定を初期化
    async initializeSettings() {
        try {
            await this.loadSettings();
        } catch (error) {
            console.warn('設定の読み込みに失敗しました。デフォルト設定を使用します。', error);
            this.loadDefaultSettings();
        }
    }

    // 設定を読み込み
    async loadSettings() {
        try {
            const response = await fetch(`${this.config.scriptUrl}?action=getSettings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('設定の取得に失敗しました');
            }

            this.settings = await response.json();
            this.updateFormWithSettings();
        } catch (error) {
            console.error('設定読み込みエラー:', error);
            throw error;
        }
    }

    // デフォルト設定を読み込み
    loadDefaultSettings() {
        this.settings = {
            giftRules: {
                sticker: { minAmount: 1000, name: 'ステッカー', description: 'チームロゴ入りステッカー' },
                towel: { minAmount: 3000, name: 'タオル', description: 'チームカラータオル' },
                't-shirt': { minAmount: 5000, name: 'Tシャツ', description: 'チームロゴTシャツ' },
                hoodie: { minAmount: 10000, name: 'フーディー', description: 'チームロゴフーディー' }
            },
            formSettings: {
                maxDonors: 20,
                minAmount: 100,
                maxAmount: 1000000,
                requiredFields: ['representativeName', 'representativePhone', 'teamName', 'eventName']
            }
        };
    }

    // 設定に基づいてフォームを更新
    updateFormWithSettings() {
        if (!this.settings) return;

        // 返礼品の選択肢を更新
        this.updateGiftOptions();
        
        // 計算機の設定を更新
        if (window.donationCalculator) {
            window.donationCalculator.giftRules = this.settings.giftRules;
        }
    }

    // 返礼品の選択肢を更新
    updateGiftOptions() {
        const giftSelects = document.querySelectorAll('.donor-gift');
        giftSelects.forEach(select => {
            // 既存のオプションをクリア（最初の「返礼品なし」は保持）
            const noGiftOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (noGiftOption) {
                select.appendChild(noGiftOption);
            }

            // 新しい返礼品オプションを追加
            Object.entries(this.settings.giftRules).forEach(([key, rule]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${rule.name}（¥${rule.minAmount.toLocaleString()}以上）`;
                select.appendChild(option);
            });
        });
    }

    // データをGoogle Sheetsに送信
    async submitData(data) {
        try {
            const response = await fetch(this.config.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'submitData',
                    data: data
                })
            });

            if (!response.ok) {
                throw new Error('データの送信に失敗しました');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('データ送信エラー:', error);
            throw error;
        }
    }

    // 設定を更新
    async updateSettings(newSettings) {
        try {
            const response = await fetch(this.config.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateSettings',
                    settings: newSettings
                })
            });

            if (!response.ok) {
                throw new Error('設定の更新に失敗しました');
            }

            this.settings = newSettings;
            this.updateFormWithSettings();
            return await response.json();
        } catch (error) {
            console.error('設定更新エラー:', error);
            throw error;
        }
    }

    // データを取得（管理者用）
    async getData(filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                action: 'getData',
                ...filters
            });

            const response = await fetch(`${this.config.scriptUrl}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }

            return await response.json();
        } catch (error) {
            console.error('データ取得エラー:', error);
            throw error;
        }
    }

    // 統計データを取得
    async getStatistics() {
        try {
            const response = await fetch(`${this.config.scriptUrl}?action=getStatistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('統計データの取得に失敗しました');
            }

            return await response.json();
        } catch (error) {
            console.error('統計データ取得エラー:', error);
            throw error;
        }
    }

    // 設定を検証
    validateSettings(settings) {
        const requiredFields = ['giftRules', 'formSettings'];
        
        for (const field of requiredFields) {
            if (!settings[field]) {
                throw new Error(`必須フィールド '${field}' が不足しています`);
            }
        }

        // 返礼品ルールの検証
        if (!settings.giftRules || Object.keys(settings.giftRules).length === 0) {
            throw new Error('返礼品ルールが設定されていません');
        }

        return true;
    }

    // エラーハンドリング
    handleError(error, context = '') {
        console.error(`${context} エラー:`, error);
        
        // ユーザーフレンドリーなエラーメッセージ
        let userMessage = 'エラーが発生しました。';
        
        if (error.message.includes('ネットワーク')) {
            userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else if (error.message.includes('設定')) {
            userMessage = '設定の読み込みに失敗しました。管理者に連絡してください。';
        } else if (error.message.includes('送信')) {
            userMessage = 'データの送信に失敗しました。もう一度お試しください。';
        }
        
        return userMessage;
    }
}

// グローバルにSheetsManagerインスタンスを作成
window.sheetsManager = new GoogleSheetsManager(); 