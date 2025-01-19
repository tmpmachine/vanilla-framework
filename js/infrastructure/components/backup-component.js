/* v1 */
let compoBackup = (function () {

    let SELF = {
        Restore,
        Download,
    };

    let local = {
        backupFileNamePrefix: 'appdata',
        backupFolderId: '',
    };

    function generateFileName() {
        let dateObj = new Date();
        let now = dateObj.getTime();
        let dateStr = pad(dateObj.getDate());
        let monthStr = pad(dateObj.getMonth());
        let yearStr = pad(dateObj.getFullYear());

        return `${local.backupFileNamePrefix}-backup-${dateStr}${monthStr}${yearStr}-${now}.json`;
    }

    function pad(number) {
        return number < 10 ? '0' + number : number;
    }

    // # restore
    function Restore() {
        let inputEl = document.createElement('input');
        inputEl.type = 'file';
        inputEl.setAttribute('accept', '.json');
        inputEl.onchange = function () {
            let reader = new FileReader();
            reader.onload = async function (evt) {
                let data = JSON.parse(reader.result);
                await storageUtil.clearStore_();

                for (let item of data.entries) {
                    let { key, value } = item;
                    await storageUtil.setItem_(key, value);
                }

                location.reload();
            };
            reader.readAsText(inputEl.files[0]);

        };

        document.body.append(inputEl);
        inputEl.click();
        inputEl.remove();
    }

    async function Download() {
        let data = await compoAppData.GetStoreData_();
        let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        downloadBlob(blob);
    }

    function downloadBlob(blob) {
        let url = URL.createObjectURL(blob);

        let el = document.createElement('a');
        el.href = url;
        el.target = '_blank';
        el.download = generateFileName();
        el.onclick = function () {
            el.remove();
        };
        document.body.append(el);
        el.click();
    }

    return SELF;

})();
