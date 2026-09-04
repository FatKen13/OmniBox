/**
 * DataHub SDK - Module kết nối Dữ liệu tập trung cho hệ sinh thái
 * Hỗ trợ:
 * 1. Đọc dữ liệu thị trường công khai (DataHub-Public)
 * 2. Đọc & Ghi dữ liệu cá nhân bảo mật (DataHub-Private)
 */
const DataHub = {
  OWNER: 'FatKen13',
  PUBLIC_REPO: 'DataHub-Public',
  PRIVATE_REPO: 'DataHub-Private',

  /**
   * 1. Đọc Dữ Liệu Công Khai (Không cần Token)
   * @param {string} endpoint - Ví dụ: "market/gold.json", "market/exchange.json"
   */
  async getPublicData(endpoint) {
    try {
      const url = `https://raw.githubusercontent.com/${this.OWNER}/${this.PUBLIC_REPO}/main/api/v1/${endpoint}?_t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Lỗi tải Public Data [${res.status}]: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn(`[DataHub] Lỗi getPublicData('${endpoint}'):`, err);
      throw err;
    }
  },

  /**
   * Lấy Personal Access Token lưu trong máy
   */
  getPersonalToken() {
    return localStorage.getItem('datahub_pat') || '';
  },

  /**
   * Lưu Token cá nhân vào máy
   */
  setPersonalToken(token) {
    localStorage.setItem('datahub_pat', token.trim());
  },

  /**
   * 2. Đọc Dữ Liệu Cá Nhân (Private)
   * @param {string} endpoint - Ví dụ: "personal/expenses.json", "personal/savings.json"
   */
  async getPrivateData(endpoint) {
    const token = this.getPersonalToken();
    if (!token) throw new Error('Chưa cấu hình GitHub Personal Access Token');

    const url = `https://api.github.com/repos/${this.OWNER}/${this.PRIVATE_REPO}/contents/api/v1/${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) throw new Error(`Lỗi tải Private Data [${res.status}]: ${res.statusText}`);
    const data = await res.json();
    const content = decodeURIComponent(escape(atob(data.content)));
    return {
      content: JSON.parse(content),
      sha: data.sha
    };
  },

  /**
   * 3. Ghi / Cập Nhật Dữ Liệu Cá Nhân (Private)
   * @param {string} endpoint - Ví dụ: "personal/expenses.json"
   * @param {object} newContentObj - Dữ liệu JSON mới
   * @param {string} sha - Mã hash sha của file hiện tại (nếu là ghi đè cập nhật)
   */
  async savePrivateData(endpoint, newContentObj, sha = null) {
    const token = this.getPersonalToken();
    if (!token) throw new Error('Chưa cấu hình GitHub Personal Access Token');

    const url = `https://api.github.com/repos/${this.OWNER}/${this.PRIVATE_REPO}/contents/api/v1/${endpoint}`;
    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(newContentObj, null, 2))));

    const payload = {
      message: `update(personal): ${endpoint} at ${new Date().toISOString()}`,
      content: encodedContent
    };
    if (sha) payload.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Lỗi ghi Private Data: ${res.statusText}`);
    return await res.json();
  }
};

window.DataHub = DataHub;
