// =========================================================================
// ⭐ 配置区：号机对应的头数和功率值 (kW) ⭐ (总共 65 组)
// =========================================================================
const machineConfig = [
    // 头数, 功率(kW)
    [16, 111], [20, 166], [20, 166], [16, 94], [20, 49], [12, 104], [16, 99], [16, 101], [16, 99], [20, 64], 
    [20, 64], [16, 199], [32, 101], [32, 101], [20, 64], [20, 68], [20, 68], [20, 68], [20, 63], [20, 63], 
    [16, 100], [12, 90], [12, 75], [20, 61], [12, 99], [12, 93], [12, 93], [12, 99], [12, 93], [12, 99], 
    [12, 99], [12, 99], 
    
    [20, 68], [16, 61], [12, 61], [12, 84], [16, 110], [20, 74], [12, 80], [12, 80], [18, 51], [18, 51], 
    [20, 105], [20, 105], [16, 104], [20, 62], [16, 84], [16, 99], [20, 76], [16, 104], [16, 87], [16, 87], 
    [20, 76], [16, 206], [16, 157], [20, 225], [20, 225], 
    
    [0, 0], // MA-58: 头数 0, 功率 0 (不存在)
    [16, 74], [12, 77], [12, 79], [12, 77], [16, 206], [16, 228], [18, 207] // MA-65
];

// MA-7/8/9 的备选配置
const alternativeConfigs = {
    // [头数, 功率(kW)]
    7: [20, 55], 
    8: [20, 51],
    9: [24, 63]
};

// =========================================================================

function getInputValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

/**
 * 切换 R14 字段的手动输入状态
 */
function toggleR14ManualInput() {
    const R14_input = document.getElementById('R14_output');
    const isManual = document.getElementById('R14_manual_check').checked;
    
    if (isManual) {
        R14_input.removeAttribute('readonly');
        R14_input.setAttribute('data-manual', 'true');
    } else {
        R14_input.setAttribute('readonly', true);
        R14_input.setAttribute('data-manual', 'false');
        // 切换回自动计算后，立即刷新自动计算的值
        lookupMachineData(); 
    }
}

/**
 * 填充配置选择器
 */
function updateConfigSelector() {
    const A12_val = parseInt(document.getElementById('A12').value);
    const selectorGroup = document.getElementById('config_selector_group');
    const selector = document.getElementById('config_selector');
    const index = A12_val - 1;

    selector.innerHTML = ''; 
    
    if (alternativeConfigs.hasOwnProperty(A12_val)) {
        selectorGroup.style.display = 'block';

        const defaultHeads = machineConfig[index][0];
        const defaultPower = machineConfig[index][1];
        const altConfig = alternativeConfigs[A12_val];
        const altHeads = altConfig[0];
        const altPower = altConfig[1];

        const option1 = document.createElement('option');
        option1.value = 'default';
        option1.text = `选项一 (默认): ${defaultHeads} 头, ${defaultPower} kW`;
        selector.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = 'alt';
        option2.text = `选项二 (新增): ${altHeads} 头, ${altPower} kW`;
        selector.appendChild(option2);

    } else {
        selectorGroup.style.display = 'none';
    }
}

/**
 * 查找并更新机器数据 (D14, M14_power, R14的自动计算值)。
 */
function lookupMachineData() {
    const A12_val = parseInt(document.getElementById('A12').value);
    const D14_input = document.getElementById('D14');
    const M14_power_input = document.getElementById('M14_power');
    const R14_output_input = document.getElementById('R14_output');
    
    // S14 必须在这里读取
    const S14_val = getInputValue('S14'); 
    const index = A12_val - 1; 
    
    let heads, power;

    if (index >= 0 && index < machineConfig.length) {
        heads = machineConfig[index][0]; 
        power = machineConfig[index][1]; 

        // 检查是否应用备选配置
        if (alternativeConfigs.hasOwnProperty(A12_val) && document.getElementById('config_selector').value === 'alt') {
            heads = alternativeConfigs[A12_val][0];
            power = alternativeConfigs[A12_val][1];
        }

        // 1. 更新 D14 (头数) 和 功率显示
        D14_input.value = heads;
        M14_power_input.value = power.toFixed(3); 

        // 2. 如果 R14 不是手动输入状态，则计算 R14
        if (!document.getElementById('R14_manual_check').checked) {
            let R14_calculated = 0;
            if (heads > 0) {
                // R14 = (S14 * Power) / D14
                R14_calculated = (S14_val * power) / heads;
            }
            R14_output_input.value = R14_calculated.toFixed(4); 
        }

    } else {
        D14_input.value = 0;
        M14_power_input.value = 0;
         if (!document.getElementById('R14_manual_check').checked) {
             R14_output_input.value = 0;
         }
    }
}

// --- 查表函数 (K9, L9, L11, L12 保持不变) ---
function getL9(K6) {
    switch(K6) {
        case "PT15": return 2.37; case "PT10": return 5.18; case "PL8": return 4.21; case "PL4": return 5.01; 
        case "PT4": return 5.48; case "HKV125": return 6.38; case "HK199": return 1.42; default: return 0;
    }
}
function getL11(K6) {
    switch(K6) {
        case "PT15": return 1; case "PT10": return 2; case "PL8": return 2; case "PL4": return 4; 
        case "PT4": return 4; case "HKV125": return 6; case "HK199": return 1; default: return 0;
    }
}
function getL12(K6) {
    switch(K6) {
        case "PT15": return 11; case "PT10": return 7; case "PL8": return 5; case "PL4": return 2.5; 
        case "PT4": return 2.5; case "HKV125": return 1.8; case "HK199": return 8; default: return 0;
    }
}
function getK9(K6) {
    switch(K6) {
        case "PT15": return 8.12; case "PT10": return 6.02; case "PL8": return 7.59; case "PL4": return 4.07; 
        case "PT4": return 6.2; case "HKV125": return 3.72; case "HK199": return 14.42; default: return 0;
    }
}

/**
 * 核心计算函数，在点击按钮时触发
 */
function calculateMargin() {
    // 每次计算前，必须确保 D14, M14, R14 是最新的（无论是自动计算还是手动输入）
    lookupMachineData();
    
    // R14 现在直接从输入字段读取 (无论是自动值还是手动值)
    const R14 = getInputValue('R14_output'); 
    
    // --- 输入值获取 ---
    const B14 = getInputValue('B14'); 
    const C14 = getInputValue('C14'); 
    const D14 = getInputValue('D14'); 
    const E14 = getInputValue('E14'); 
    const F12 = getInputValue('F12'); 
    const I8 = getInputValue('I8');   
    const I12 = getInputValue('I12');  
    const J12 = getInputValue('J12');  
    const H12 = getInputValue('H12');  
    const N12 = getInputValue('N12');  
    const P12 = getInputValue('P12');  
    const K6 = document.getElementById('K6').value; 
    const M11 = document.getElementById('M11').value; 

    // --- 查表值获取 ---
    const K9 = getK9(K6);
    const L9 = getL9(K6);
    const L11 = getL11(K6);
    const L12 = getL12(K6);
    
    // --- 1. 中间计算 (B16, C16, D16) ---
    const B16 = ((C14 * C14 / 4) - (B14 * B14 / 4)) * 3.14;
    // C16 = 1 / (铜截面 * 密度 + 漆截面 * 密度)
    const C16 = 1 / ((B14 * B14 / 4) * 0.01 * 3.14 * 8.89 + B16 * 0.01 * 1.3);
    const D16 = C16 * B16 * 1.3 / 100;
    
    // --- 2. 生产量 F14 ---
    // F14 = 铜截面 * 密度 * 线速(m/min) * 60 * 24 * F12 * D14 / 1000
    const F14 = Math.pow((B14 / 2), 2) * 3.14 * 8.89 * E14 * 60 * 24 * F12 * D14 / 1000;
    
    if (F14 <= 0 || D14 === 0) {
        const zeroOutput = '0.00';
        document.getElementById('F14').innerText = zeroOutput;
        document.getElementById('G14_output').innerText = zeroOutput;
        document.getElementById('K14_output').innerText = zeroOutput;
        document.getElementById('L14_output').innerText = zeroOutput;
        document.getElementById('O14').innerText = zeroOutput;
        document.getElementById('P14').innerText = zeroOutput;
        document.getElementById('Q14').innerText = zeroOutput;
        return;
    }
    
    // --- 3. G14 (06换算) ---
    let G14 = 0;
    if (B14 !== 0) {
         // G14 = F14 * (0.03^2 / B14^2) 
         G14 = 0.03 * 0.03 * F14 / (B14 * B14 / 4 * 4); // 简化后的公式
    }

    // --- 4. 成本/收入项计算 ---
    const H14 = F14 * H12; // 加工费收入
    const I14 = F14 * D16 / I12 * 100 * I8 * 1.68; // 漆成本
    const J14 = (F14 - F14 * D16) * J12; // 铜加工费
    const K14 = (L12 !== 0) ? (F14 / L12 * K9) : 0; // 线轴成本
    const L14 = (L12 !== 0 && L11 !== 0) ? (F14 * L9 / L12 / L11) : 0; // 包装费
    
    let M12;
    if (M11 === "華東" || M11 === "華北") {
        M12 = 0.8;
    } else if (M11 === "華南") {
        M12 = 1.2;
    } else if (M11 === "船") {
        M12 = 2;
    } else {
        M12 = 0; 
    }
    const M14 = F14 * M12; // 运输费
    const N14 = G14 * N12; // ダイス费
    
    // --- 5. 总成本 O14 ---
    const sum_I14_N14 = I14 + J14 + K14 + L14 + M14 + N14;
    const O14 = sum_I14_N14 * (1 + P12);

    // --- 6. 最终毛利 P14, Q14 ---
    const P14 = H14 - O14; // 粗利 (不含电费)
    // Q14 = P14 - R14 * 24 * D14 * F12
    const Q14 = P14 - R14 * 24 * D14 * F12; // 含电费粗利


    // --- 7. 更新界面 ---
    document.getElementById('F14').innerText = F14.toFixed(8); 
    document.getElementById('G14_output').innerText = G14.toFixed(8);
    document.getElementById('K14_output').innerText = K14.toFixed(2);
    document.getElementById('L14_output').innerText = L14.toFixed(2);
    document.getElementById('O14').innerText = O14.toFixed(2);
    document.getElementById('P14').innerText = P14.toFixed(2) + ' 元';
    document.getElementById('Q14').innerText = Q14.toFixed(2) + ' 元';
}

// 页面加载时执行的初始化
document.addEventListener('DOMContentLoaded', () => {
    updateConfigSelector();
    
    // S14 改变时，重新计算 R14 (如果不是手动输入)
    document.getElementById('S14').addEventListener('input', lookupMachineData);
    
    // R14 字段在非手动模式下，值改变也需要触发 lookupMachineData 来重新计算
    document.getElementById('R14_output').addEventListener('input', () => {
         if (!document.getElementById('R14_manual_check').checked) {
             lookupMachineData();
         }
    });
    
    lookupMachineData(); 
});
