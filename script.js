/* script.js */

// 1. 数据常量定义
const machineData = [
    [16, 111], [20, 166], [20, 166], [16, 94], [20, 49], [12, 104], [16, 99], [16, 101], [16, 99], [20, 64], 
    [20, 64], [16, 199], [32, 101], [32, 101], [20, 64], [20, 68], [20, 68], [20, 68], [20, 63], [20, 63], 
    [16, 100], [12, 90], [12, 75], [20, 61], [12, 99], [12, 93], [12, 93], [12, 99], [12, 93], [12, 99], 
    [12, 99], [12, 99], [20, 68], [16, 61], [12, 61], [12, 84], [16, 110], [20, 74], [12, 80], [12, 80], 
    [18, 51], [18, 51], [20, 105], [20, 105], [16, 104], [20, 62], [16, 84], [16, 99], [20, 76], [16, 104], 
    [16, 87], [16, 87], [20, 76], [16, 206], [16, 157], [20, 225], [20, 225], [0, 0], [16, 74], [12, 77], 
    [12, 79], [12, 77], [16, 206], [16, 228], [18, 207]
];

const altConfigs = { 7: [20, 55], 8: [20, 51], 9: [24, 63] };

// 2. 初始化函数
window.onload = function() {
    const a12Select = document.getElementById('A12');
    // 生成号机选项
    for(let i=1; i<=65; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.text = `MA-${i}`;
        if(i === 11) opt.selected = true;
        a12Select.appendChild(opt);
    }
    lookupMachineData();
    updateConfigSelector();
};

// 3. 联动逻辑
function lookupMachineData() {
    const a12 = parseInt(document.getElementById('A12').value);
    const index = a12 - 1;
    let h = machineData[index][0], p = machineData[index][1];

    const cfgSel = document.getElementById('config_selector');
    if (altConfigs[a12] && cfgSel.value === 'alt') {
        h = altConfigs[a12][0]; p = altConfigs[a12][1];
    }

    document.getElementById('D14').value = h;
    document.getElementById('M14_power').value = p.toFixed(3);
}

function updatePaintPrice() {
    const sel = document.getElementById('I7_select');
    const pInput = document.getElementById('I8');
    const nInput = document.getElementById('A14');
    if (sel.value && sel.value !== "0") {
        pInput.value = sel.value;
        nInput.value = sel.options[sel.selectedIndex].text;
    }
}

function updateConfigSelector() {
    const a12 = parseInt(document.getElementById('A12').value);
    const group = document.getElementById('config_selector_group');
    const sel = document.getElementById('config_selector');
    sel.innerHTML = '';
    if (altConfigs[a12]) {
        group.style.display = 'block';
        sel.innerHTML = `<option value="default">默认: ${machineData[a12-1][0]}头</option>
                         <option value="alt">备选: ${altConfigs[a12][0]}头</option>`;
    } else { group.style.display = 'none'; }
}

// 4. 核心计算
function calculateMargin() {
    const getV = (id) => parseFloat(document.getElementById(id).value) || 0;

    const B14=getV('B14'), C14=getV('C14'), D14=getV('D14'), E14=getV('E14'), F12=getV('F12');
    const I8=getV('I8'), I12=getV('I12'), H12=getV('H12'), S14=getV('S14');
    const K6=document.getElementById('K6').value;

    // 查表系数
    const axis = {"PT10": {L9:5.18, L11:2, L12:7, K9:6.02}, "PT15": {L9:2.37, L11:1, L12:11, K9:8.12}}[K6] || {L9:0, L11:0, L12:0, K9:0};
    
    // 公式
    const B16 = ((C14**2/4)-(B14**2/4))*3.14;
    const D16 = (1/((B14**2/4)*0.01*3.14*8.89 + B16*0.01*1.3)) * B16 * 1.3 / 100;
    const F14 = (B14/2)**2 * 3.14 * 8.89 * E14 * 60 * 24 * F12 * D14 / 1000;

    if (F14 <= 0) return alert("请检查参数输入");

    const G14 = (0.03**2 * F14) / (B14/2)**2;
    const I14 = F14 * D16 / I12 * 100 * I8 * 1.68;
    const K14 = F14 / axis.L12 * axis.K9;
    const L14 = F14 * axis.L9 / axis.L12 / axis.L11;
    
    const O14 = (I14 + (F14-F14*D16)*1.5 + K14 + L14 + F14*0.8 + G14*1.6) * 1.038;
    const P14 = F14 * H12 - O14;
    const Q14 = P14 - (S14 * getV('M14_power') / D14) * 24 * D14 * F12;

    document.getElementById('F14').innerText = F14.toFixed(4);
    document.getElementById('O14').innerText = O14.toFixed(2);
    document.getElementById('P14').innerText = P14.toFixed(2);
    document.getElementById('Q14').innerText = Q14.toFixed(2);
}
