
//Tính toán giá trị skip phục vụ các tác vụ phân trang
export const paginSkipValue = (page, itemsPerPage) => {
  //Luôn đảm bảo nếu giá trị không hợp lệ thì return về 0 hết
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  /**
     * Giải thích
     * VD hiện thị mỗi page 12 sản phẩm (itemsPerPage = 12)
     * Case 1: User đứng page 1 (page = 1) thì sẽ lấy 1 - 1 = 0
     * sau đó nhân với 12 thì = 0, tức skip = 0 thì sẽ không skip bản ghi
     * Case 2: User đứng page 2 (page = 2) thì 2 - 1 = 1
     * sau đó nhân với 12 thì = 12, tức là skip 12 bản ghi
     * tương tự....
     */
  return (page - 1) * itemsPerPage
}