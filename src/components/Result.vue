<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    width="800px"
    class="c-Result"
    :append-to-body="true"
  >
    <div class="dialog-header" slot="title">
      <span class="title">抽奖结果</span>
      <span class="subtitle">(点击获奖者可以移除)</span>
    </div>

    <div class="result-container">
      <div 
        v-for="(item, index) in resultList" 
        :key="index"
        class="prize-category"
      >
        <div class="category-name">{{ item.name }}</div>
        <div class="winners-grid">
          <template v-if="item.value && item.value.length > 0">
            <div
              v-for="(winnerId, j) in item.value"
              :key="j"
              class="winner-card"
              @click="deleteRes($event, item, winnerId)"
            >
              <div class="winner-content">
                <div class="winner-photo" v-if="getWinnerPhoto(winnerId)">
                  <img :src="getWinnerPhoto(winnerId)" alt="获奖者照片"/>
                </div>
                <div class="winner-info">
                  <span class="winner-name">{{ getWinnerName(winnerId) }}</span>
                  <span class="winner-number">#{{ winnerId }}</span>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="no-winners">
            暂未抽奖
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { conversionCategoryName } from '@/helper/index';

export default {
  name: 'c-Result',
  props: {
    visible: Boolean
  },
  computed: {
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    resultList() {
      const list = [];
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          let name = conversionCategoryName(key);
          list.push({
            label: key,
            name,
            value: element
          });
        }
      }
      return list;
    }
  },
  methods: {
    getWinnerName(id) {
      const winner = this.$store.state.list.find(item => item.key === id);
      return winner ? winner.name : `未知姓名`;
    },
    getWinnerPhoto(id) {
      const photo = this.$store.state.photos.find(item => item.id === id);
      return photo ? photo.value : null;
    },
    deleteRes(event, row, winnerId) {
      this.$confirm('确认要移除该获奖者吗？移除后可重新参与抽奖', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const result = this.result;
          result[row.label] = this.result[row.label].filter(
            item => item !== winnerId
          );
          this.result = result;
          this.$message({
            type: 'success',
            message: '已移除该获奖者'
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="scss">
.c-Result {
  .el-dialog {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .dialog-header {
      padding: 20px;
      background: linear-gradient(45deg, #23d5ab, #23a6d5);
      color: white;

      .title {
        font-size: 24px;
        font-weight: 600;
      }

      .subtitle {
        font-size: 14px;
        margin-left: 15px;
        opacity: 0.8;
      }
    }

    .result-container {
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;

      .prize-category {
        margin-bottom: 30px;

        &:last-child {
          margin-bottom: 0;
        }

        .category-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
          padding-left: 15px;
          border-left: 4px solid #23a6d5;
        }

        .winners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          
          .no-winners {
            grid-column: 1 / -1;
            text-align: center;
            padding: 20px;
            color: #999;
            font-style: italic;
          }
        }

        .winner-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.1);
          
          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            border-color: #23a6d5;
          }

          .winner-content {
            display: flex;
            align-items: center;
            gap: 12px;

            .winner-photo {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              overflow: hidden;
              
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .winner-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 5px;

              .winner-name {
                font-size: 16px;
                font-weight: 500;
                color: #333;
              }

              .winner-number {
                font-size: 12px;
                color: #999;
              }
            }
          }
        }
      }
    }
  }

  .el-dialog__body {
    padding: 0 !important;
  }

  .el-dialog__header {
    padding: 0 !important;
    margin: 0 !important;
  }
}
</style>
