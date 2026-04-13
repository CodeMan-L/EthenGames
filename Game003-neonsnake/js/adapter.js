const AdAdapter = {
    _adAttempts: 0,
    _adTimeout: 10000,

    showRewardedAd() {
        this._adAttempts++;
        const attemptId = this._adAttempts;
        const startTime = performance.now();
        console.log(`[AdAdapter] 广告请求 #${attemptId} 开始, 时间: ${new Date().toISOString()}`);

        return new Promise((resolve) => {
            const modal = document.getElementById('ad-modal');
            const adContent = document.getElementById('ad-content');
            const adTimer = document.getElementById('ad-timer');

            if (!modal) {
                console.warn('[AdAdapter] 广告弹窗元素不存在, 直接返回成功');
                resolve({success: true, reason: 'no_modal'});
                return;
            }

            let resolved = false;
            const safeResolve = (result) => {
                if (resolved) return;
                resolved = true;
                const elapsed = (performance.now() - startTime).toFixed(0);
                console.log(`[AdAdapter] 广告 #${attemptId} 结束, 结果: ${result.success ? '成功' : '失败'}, 原因: ${result.reason || '无'}, 耗时: ${elapsed}ms`);
                resolve(result);
            };

            const timeoutId = setTimeout(() => {
                console.warn(`[AdAdapter] 广告 #${attemptId} 超时(${this._adTimeout}ms), 强制成功`);
                modal.classList.add('hidden');
                safeResolve({success: true, reason: 'timeout'});
            }, this._adTimeout);

            modal.classList.remove('hidden');
            let remaining = 3;
            adTimer.textContent = remaining;
            adContent.textContent = '広告を読み込み中...';

            const countdown = setInterval(() => {
                remaining--;
                if (remaining > 0) {
                    adTimer.textContent = remaining;
                    adContent.textContent = '広告を再生中...';
                } else {
                    clearInterval(countdown);
                    clearTimeout(timeoutId);
                    modal.classList.add('hidden');
                    safeResolve({success: true, reason: 'completed'});
                }
            }, 1000);
        });
    },

    shareToTikTok() {
        if (navigator.share) {
            navigator.share({
                title: CONFIG.JP.TITLE,
                text: `${CONFIG.JP.SUBTITLE} - 超楽しいゲーム！`,
                url: window.location.href,
            });
        }
    },
};

window.AdAdapter = AdAdapter;
