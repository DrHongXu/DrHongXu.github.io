/**
 * 设备优化器 - 根据设备类型条件加载内容
 * 适用于所有HTML文件，节省资源并加快加载速度
 */

class DeviceOptimizer {
    constructor() {
        this.deviceType = this.detectDeviceType();
        this.isInitialized = false;
        this.forceRefresh = this.detectForceRefresh();
    }

    /**
     * 检测是否强制刷新
     */
    detectForceRefresh() {
        // 检测Ctrl+R或F5刷新
        const isForceRefresh = sessionStorage.getItem('forceRefresh') === 'true' || 
                              performance.navigation.type === 1; // TYPE_RELOAD
        
        // 检测URL参数中的强制刷新标记
        const urlParams = new URLSearchParams(window.location.search);
        const hasForceParam = urlParams.has('force') || urlParams.has('refresh');
        
        return isForceRefresh || hasForceParam;
    }

    /**
     * 检测设备类型
     */
    detectDeviceType() {
        // 如果是强制刷新，重新检测设备类型
        if (this.forceRefresh) {
            console.log('Force refresh detected, re-detecting device type...');
            return this.fallbackDeviceDetection();
        }
        
        const deviceInfo = localStorage.getItem('deviceInfo');
        if (deviceInfo) {
            try {
                const data = JSON.parse(deviceInfo);
                return data.deviceType || this.fallbackDeviceDetection();
            } catch (e) {
                console.warn('Failed to parse deviceInfo, using fallback detection');
            }
        }
        return this.fallbackDeviceDetection();
    }

    /**
     * 备用设备检测方法
     */
    fallbackDeviceDetection() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * 初始化优化器
     */
    init() {
        if (this.isInitialized) return;
        
        // 如果是强制刷新，清理缓存
        if (this.forceRefresh) {
            this.clearCache();
        }
        
        // 立即隐藏不需要的元素
        this.hideUnnecessaryElements();
        
        // 延迟加载图片资源
        this.optimizeImageLoading();
        
        // 优化脚本加载
        this.optimizeScriptLoading();
        
        // 更新设备信息缓存
        this.updateDeviceInfoCache();
        
        this.isInitialized = true;
        console.log(`DeviceOptimizer initialized for: ${this.deviceType}${this.forceRefresh ? ' (force refresh)' : ''}`);
    }

    /**
     * 隐藏不需要的元素
     */
    hideUnnecessaryElements() {
        const elementsToHide = this.deviceType === 'mobile' 
            ? document.querySelectorAll('.hidden-mobile') 
            : document.querySelectorAll('.display-mobile');

        elementsToHide.forEach(element => {
            // 立即隐藏，避免闪烁
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            
            // 标记为已优化
            element.setAttribute('data-optimized', 'true');
        });
    }

    /**
     * 优化图片加载
     */
    optimizeImageLoading() {
        const images = document.querySelectorAll('img[data-mobile-src], img[data-desktop-src]');
        
        images.forEach(img => {
            const shouldLoad = this.shouldLoadImage(img);
            if (!shouldLoad) {
                // 移除不需要的图片元素
                img.remove();
                return;
            }

            // 根据设备类型设置正确的src
            const correctSrc = this.getCorrectImageSrc(img);
            if (correctSrc && img.src !== correctSrc) {
                img.src = correctSrc;
            }
        });
    }

    /**
     * 判断是否应该加载图片
     */
    shouldLoadImage(img) {
        const hasMobileClass = img.classList.contains('display-mobile');
        const hasDesktopClass = img.classList.contains('hidden-mobile');
        
        if (this.deviceType === 'mobile') {
            return hasMobileClass && !hasDesktopClass;
        } else {
            return hasDesktopClass && !hasMobileClass;
        }
    }

    /**
     * 获取正确的图片源
     */
    getCorrectImageSrc(img) {
        if (this.deviceType === 'mobile') {
            return img.getAttribute('data-mobile-src') || img.src;
        } else {
            return img.getAttribute('data-desktop-src') || img.src;
        }
    }

    /**
     * 优化脚本加载
     */
    optimizeScriptLoading() {
        // 对于移动设备，可以延迟加载某些非关键脚本
        if (this.deviceType === 'mobile') {
            this.deferNonCriticalScripts();
        }
    }

    /**
     * 延迟加载非关键脚本
     */
    deferNonCriticalScripts() {
        const nonCriticalScripts = [
            'js/analytics.js',
            'js/advanced-features.js'
        ];

        nonCriticalScripts.forEach(scriptSrc => {
            const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
            if (existingScript) {
                // 延迟加载
                setTimeout(() => {
                    if (!existingScript.loaded) {
                        existingScript.src = scriptSrc;
                        existingScript.loaded = true;
                    }
                }, 2000);
            }
        });
    }

    /**
     * 动态加载内容
     */
    loadContentDynamically(containerId, mobileContent, desktopContent) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const content = this.deviceType === 'mobile' ? mobileContent : desktopContent;
        container.innerHTML = content;
    }

    /**
     * 清理缓存
     */
    clearCache() {
        console.log('Clearing device optimization cache...');
        
        // 清理sessionStorage中的强制刷新标记
        sessionStorage.removeItem('forceRefresh');
        
        // 清理localStorage中的设备信息（可选）
        // localStorage.removeItem('deviceInfo');
        
        // 清理页面中的优化标记
        document.querySelectorAll('[data-optimized="true"]').forEach(element => {
            element.removeAttribute('data-optimized');
        });
    }

    /**
     * 更新设备信息缓存
     */
    updateDeviceInfoCache() {
        if (this.forceRefresh) {
            const deviceInfo = {
                deviceType: this.deviceType,
                width: window.innerWidth,
                height: window.innerHeight,
                timestamp: Date.now(),
                forceRefresh: true
            };
            
            // 更新localStorage中的设备信息
            const existingInfo = localStorage.getItem('deviceInfo');
            if (existingInfo) {
                try {
                    const existing = JSON.parse(existingInfo);
                    const updated = { ...existing, ...deviceInfo };
                    localStorage.setItem('deviceInfo', JSON.stringify(updated));
                } catch (e) {
                    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
                }
            }
        }
    }

    /**
     * 手动触发强制刷新
     */
    forceRefreshCache() {
        console.log('Manually triggering cache refresh...');
        sessionStorage.setItem('forceRefresh', 'true');
        window.location.reload();
    }

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return {
            type: this.deviceType,
            width: window.innerWidth,
            height: window.innerHeight,
            userAgent: navigator.userAgent,
            forceRefresh: this.forceRefresh
        };
    }
}

// 全局实例
window.deviceOptimizer = new DeviceOptimizer();

// 监听键盘事件，检测Ctrl+R
document.addEventListener('keydown', function(event) {
    // 检测Ctrl+R (Windows/Linux) 或 Cmd+R (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        console.log('Ctrl+R detected, marking for force refresh...');
        sessionStorage.setItem('forceRefresh', 'true');
    }
    
    // 检测F5键
    if (event.key === 'F5') {
        console.log('F5 detected, marking for force refresh...');
        sessionStorage.setItem('forceRefresh', 'true');
    }
});

// 监听页面刷新事件
window.addEventListener('beforeunload', function() {
    // 如果用户主动刷新页面，标记为强制刷新
    if (performance.navigation.type === 1) {
        sessionStorage.setItem('forceRefresh', 'true');
    }
});

// 页面加载完成后立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.deviceOptimizer.init();
    });
} else {
    window.deviceOptimizer.init();
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceOptimizer;
}
