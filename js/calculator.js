// 寄付計算クラス
class DonationCalculator {
    constructor() {
        this.giftRules = {
            towel: { minAmount: 10000, name: 'タオル' },
            sweets: { minAmount: 5000, name: 'お菓子' },
            keychain: { minAmount: 5000, name: 'キーホルダー' },
            clearfile: { minAmount: 0, name: 'クリアファイル' },
            clearfile_25: { minAmount: 5000, name: 'クリアファイル25枚(団体様)' },
            clearfile_50: { minAmount: 10000, name: 'クリアファイル50枚(団体様)' }
        };
    }

    // 合計を計算
    calculateTotals() {
        const donorRows = document.querySelectorAll('.donor-row');
        let totalAmount = 0;
        let giftCount = 0;
        let donorCount = donorRows.length;

        donorRows.forEach(row => {
            const amountTypeSelect = row.querySelector('.donor-amount-type');
            const amountCustomInput = row.querySelector('.donor-amount-input input');
            const giftSelect = row.querySelector('.donor-gift');
            
            if (amountTypeSelect && amountTypeSelect.value) {
                let amount = 0;
                
                if (amountTypeSelect.value === '10000') {
                    amount = 10000;
                } else if (amountTypeSelect.value === '5000') {
                    amount = 5000;
                } else if (amountTypeSelect.value === 'other' && amountCustomInput) {
                    amount = parseInt(amountCustomInput.value) || 0;
                }
                
                totalAmount += amount;
                
                // 返礼品が選択されている場合はカウント
                if (giftSelect && giftSelect.value) {
                    giftCount++;
                }
            }
        });

        return {
            donorCount,
            totalAmount,
            giftCount
        };
    }

    // 金額に基づいて返礼品を自動選択
    autoSelectGift(amountInput, giftSelect) {
        const amount = parseInt(amountInput.value) || 0;
        
        // 金額に応じて適切な返礼品を提案
        let suggestedGift = '';
        for (const [giftKey, rule] of Object.entries(this.giftRules)) {
            if (amount >= rule.minAmount) {
                suggestedGift = giftKey;
            }
        }

        // 現在選択されている返礼品がない場合のみ自動選択
        if (!giftSelect.value && suggestedGift) {
            giftSelect.value = suggestedGift;
            this.showGiftSuggestion(amountInput, suggestedGift);
        }
    }

    // 返礼品提案を表示
    showGiftSuggestion(amountInput, giftKey) {
        const rule = this.giftRules[giftKey];
        if (rule) {
            console.log(`${rule.name}が選択されました（¥${rule.minAmount}以上）`);
        }
    }

    // 返礼品ルールを取得
    getGiftRules() {
        return this.giftRules;
    }

    // 金額から返礼品を取得
    getGiftForAmount(amount) {
        for (const [giftKey, rule] of Object.entries(this.giftRules)) {
            if (amount >= rule.minAmount) {
                return { key: giftKey, ...rule };
            }
        }
        return null;
    }

    // 返礼品の説明を取得
    getGiftDescription(giftKey) {
        const rule = this.giftRules[giftKey];
        return rule ? rule.name : '';
    }

    // 金額の妥当性をチェック
    validateAmount(amount) {
        if (amount < 0) {
            return { valid: false, message: '金額は0以上で入力してください' };
        }
        if (amount > 1000000) {
            return { valid: false, message: '金額は1,000,000円以下で入力してください' };
        }
        return { valid: true };
    }

    // 合計金額の表示形式を整形
    formatAmount(amount) {
        return `¥${amount.toLocaleString()}`;
    }

    // 寄付者ごとの詳細計算
    calculateDonorDetails(donorData) {
        const amount = donorData.amount || 0;
        const gift = donorData.gift || '';
        
        return {
            amount: amount,
            gift: gift,
            giftDescription: this.getGiftDescription(gift),
            hasGift: !!gift
        };
    }

    // 統計情報を計算
    calculateStatistics(donors) {
        if (!donors || donors.length === 0) {
            return {
                totalAmount: 0,
                averageAmount: 0,
                maxAmount: 0,
                minAmount: 0,
                giftDistribution: {},
                totalDonors: 0
            };
        }

        const amounts = donors.map(d => d.amount || 0).filter(a => a > 0);
        const giftCounts = {};
        
        donors.forEach(donor => {
            if (donor.gift) {
                giftCounts[donor.gift] = (giftCounts[donor.gift] || 0) + 1;
            }
        });

        return {
            totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
            averageAmount: amounts.length > 0 ? Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length) : 0,
            maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
            minAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
            giftDistribution: giftCounts,
            totalDonors: donors.length
        };
    }

    // 金額選択の検証
    validateAmountSelection(amountType, customAmount) {
        if (!amountType) {
            return { valid: false, message: '金額を選択してください' };
        }
        
        if (amountType === 'other' && (!customAmount || customAmount <= 0)) {
            return { valid: false, message: 'その他の場合は金額を入力してください' };
        }
        
        return { valid: true };
    }
}

// グローバルに計算機インスタンスを作成
window.donationCalculator = new DonationCalculator(); 
