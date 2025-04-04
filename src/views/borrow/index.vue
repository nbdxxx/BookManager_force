<template>
  <div class="app-container">
    <!-- 顶部功能区 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-container">
        <el-input 
          v-permission="['admin']"
          v-model="queryParam.username" 
          placeholder="用户名"
          clearable
          class="filter-item"
          @keyup.enter.native="handleFilter">
          <i slot="prefix" class="el-input__icon el-icon-user"></i>
        </el-input>
        
        <el-input 
          v-model="queryParam.bookname" 
          placeholder="图书名"
          clearable
          class="filter-item"
          @keyup.enter.native="handleFilter">
          <i slot="prefix" class="el-input__icon el-icon-notebook-2"></i>
        </el-input>
        
        <el-button-group class="btn-group">
          <el-button 
            type="success" 
            icon="el-icon-search" 
            @click="handleFilter">
            搜索
          </el-button>
          <el-button 
            type="info" 
            icon="el-icon-refresh" 
            @click="handleShowAll">
            重置
          </el-button>
          <el-button 
            v-permission="['admin']"
            type="danger" 
            icon="el-icon-delete" 
            @click="handleDeleteSome">
            批量删除
          </el-button>
        </el-button-group>
      </div>
    </el-card>

    <!-- 新增排行榜卡片 -->
    <el-card shadow="hover" class="ranking-card">
      <div slot="header" class="clearfix">
        <span class="card-title">热门图书排行榜</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          icon="el-icon-refresh"
          @click="fetchRankingData">
          刷新
        </el-button>
      </div>
      <el-table
        :data="rankingData"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{background: '#f5f7fa', color: '#606266'}">
        <el-table-column 
          prop="bookName" 
          label="图书名称" 
          min-width="180"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column 
          prop="borrowCount" 
          label="借阅次数" 
          width="120"
          align="center">
        </el-table-column>
        <el-table-column 
          label="排名" 
          width="80"
          align="center">
          <template slot-scope="scope">
            <el-tag :type="getRankType(scope.$index)" effect="dark">
              {{ scope.$index + 1 }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        ref="multipleTable"
        :data="tableData"
        border
        stripe
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        empty-text="暂无借阅记录"
        style="width: 100%"
        :header-cell-style="{background: '#f5f7fa', color: '#606266'}">
        
        <el-table-column type="selection" width="45" align="center"></el-table-column>
        <el-table-column prop="borrowid" label="序号" width="80" align="center"></el-table-column>
        
        <el-table-column 
          prop="username" 
          label="用户名" 
          min-width="120"
          show-overflow-tooltip>
        </el-table-column>
        
        <el-table-column 
          prop="bookname" 
          label="图书名" 
          min-width="150"
          show-overflow-tooltip>
        </el-table-column>
        
        <el-table-column 
          prop="borrowtimestr" 
          label="借书时间" 
          width="160"
          align="center">
        </el-table-column>
        
        <el-table-column 
          label="还书状态" 
          width="120"
          align="center">
          <template slot-scope="scope">
            <el-tag 
              :type="scope.row.returntimestr ? 'success' : 'danger'"
              size="small"
              effect="light">
              {{scope.row.returntimestr ? '已归还' : '待归还'}}
            </el-tag>
            <div v-if="scope.row.returntimestr" class="return-time">
              {{scope.row.returntimestr}}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column 
          label="操作" 
          :width="roleIsAdmin ? 180 : 120"
          align="center" 
          fixed="right">
          <template slot-scope="scope">
            <el-button 
              v-permission="['admin']"
              @click="handleDelete(scope.row,scope.$index)" 
              type="danger" 
              icon="el-icon-delete" 
              size="mini" 
              circle
              class="action-btn"></el-button>
              
            <el-button 
              @click="handleReturn(scope.row,scope.$index)" 
              type="success" 
              icon="el-icon-circle-close" 
              size="mini" 
              circle
              class="action-btn"
              :disabled="!!scope.row.returntimestr"></el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryParam.page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryParam.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="recordTotal"
        class="pagination">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import permission from '@/directive/permission/index.js'
import waves from '@/directive/waves'
import { 
  getCount,
  queryBorrows,
  queryBorrowsByPage,
  addBorrow,
  deleteBorrow,
  deleteBorrows,
  updateBorrow,
  returnBook,
  getBookBorrowRanking 
} from '@/api/borrow'

export default {
  name: 'Borrow',
  directives: { waves, permission },
  data() {
    return {
      loading: false,
      tableData: [],
      rankingData: [],
      recordTotal: 0,
      queryParam: {
        page: 1,
        limit: 10,
        userid: null,
        username: null,
        bookname: null,
      }
    }
  },
  computed: {
    ...mapGetters(['id','name','roles']),
    roleIsAdmin() {
      return this.roles[0] === 'admin'
    }
  },
  created() {
    this.fetchData()
    this.fetchRankingData()
  },
  methods: {
    fetchRankingData() {
      this.loading = true
      getBookBorrowRanking(10).then(res => {
        if (res.status === 0 && res.data) {
          this.rankingData = res.data
        } else {
          this.$message.warning(res.message || '获取排行榜数据失败')
        }
      }).finally(() => {
        this.loading = false
      })
    },
    getRankType(index) {
      const rankColors = ['danger', 'warning', 'success']
      return index < rankColors.length ? rankColors[index] : 'info'
    },
    fetchData() {
      this.loading = true
      queryBorrowsByPage(this.queryParam).then(res => {
        this.tableData = res.data
        this.recordTotal = res.count
      }).finally(() => {
        this.loading = false
      })
    },
    handleSizeChange(curSize) {
      this.queryParam.limit = curSize
      this.fetchData()
    },
    handleCurrentChange(curPage) {
      this.queryParam.page = curPage
      this.fetchData()
    },
    handleFilter() {
      this.queryParam.page = 1
      this.fetchData()
    },
    handleShowAll() {
      this.queryParam = {
        page: 1,
        limit: this.queryParam.limit,
        userid: this.roleIsAdmin ? null : this.id,
        username: null,
        bookname: null
      }
      this.fetchData()
    },
    handleDelete(row, index) {
      this.$confirm('确定要删除该条借阅记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBorrow(row).then(res => {
          if(res === 1) {
            this.$message.success('删除成功')
            this.tableData.splice(index, 1)
            if(this.tableData.length === 0 && this.queryParam.page > 1) {
              this.queryParam.page -= 1
              this.fetchData()
            }
          } else {
            this.$message.error('删除失败')
          }
        }).finally(() => {
          this.loading = false
        })
      })
    },
    handleDeleteSome() {
      const items = this.$refs.multipleTable.selection
      if (items.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      this.$confirm(`确定要删除选中的${items.length}条借阅记录吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBorrows(items).then(res => {
          if(res > 0) {
            this.$message.success(`成功删除${res}条记录`)
            if(this.tableData.length === res) {
              this.queryParam.page = Math.max(1, this.queryParam.page - 1)
            }
            this.fetchData()
          } else {
            this.$message.error('删除失败')
          }
        }).finally(() => {
          this.loading = false
        })
      })
    },
    handleReturn(row, index) {
      this.$confirm('确定要归还这本图书吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        returnBook(row.borrowid, row.bookid).then(res => {
          if(res === 1) {
            this.$message.success('还书成功')
            this.fetchData()
          } else {
            this.$message.error('还书失败')
          }
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 84px);
}

/* 卡片样式 */
.el-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: none;
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }
}

.filter-card {
  background: linear-gradient(135deg, #f6f9fc 0%, #eef2f6 100%);
  border-left: 4px solid #409EFF;
}

.ranking-card {
  border-top: 3px solid #FFC107;
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.table-card {
  .el-table {
    font-size: 14px;
  }
}

/* 过滤区域 */
.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.filter-item {
  flex: 1;
  min-width: 220px;
  
  ::v-deep .el-input__inner {
    border-radius: 8px;
    padding-left: 35px;
  }
  
  ::v-deep .el-input__icon {
    line-height: 40px;
  }
}

.btn-group {
  margin-left: auto;
  
  .el-button {
    border-radius: 8px;
    padding: 10px 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
    
    & + .el-button {
      margin-left: 12px;
    }
  }
}

/* 表格优化 */
.el-table {
  ::v-deep th {
    font-weight: 600;
    color: #34495e;
    background-color: #f5f7fa !important;
  }
  
  ::v-deep td {
    padding: 12px 0;
  }
  
  ::v-deep tr:hover td {
    background-color: #f5f9fe !important;
  }
}

/* 标签样式 */
.el-tag {
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  font-size: 12px;
  border: none;
  
  &--success {
    background-color: rgba(82, 196, 26, 0.1);
    color: #52c41a;
  }
  
  &--danger {
    background-color: rgba(255, 77, 79, 0.1);
    color: #ff4d4f;
  }
  
  &--warning {
    background-color: rgba(250, 173, 20, 0.1);
    color: #faad14;
  }
  
  &--info {
    background-color: rgba(24, 144, 255, 0.1);
    color: #1890ff;
  }
  
  &.effect-dark {
    color: white;
    
    &.el-tag--success {
      background-color: #52c41a;
    }
    
    &.el-tag--danger {
      background-color: #ff4d4f;
    }
    
    &.el-tag--warning {
      background-color: #faad14;
    }
    
    &.el-tag--info {
      background-color: #1890ff;
    }
  }
}

.return-time {
  color: #67c23a;
  font-size: 12px;
  margin-top: 4px;
}

/* 操作按钮 */
.action-btn {
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* 分页 */
.pagination {
  margin-top: 24px;
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-item {
    min-width: 100%;
  }
  
  .btn-group {
    width: 100%;
    justify-content: flex-end;
    margin-top: 12px;
  }
  
  .el-card {
    border-radius: 8px;
  }
}
</style>