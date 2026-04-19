package com.duwniy.toolsly.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

public class ItemHistoryResponse {
    private OffsetDateTime timestamp;
    private String oldCondition;
    private String newCondition;
    private String staffName;
    private String comment;

    public ItemHistoryResponse() {}

    public OffsetDateTime getTimestamp() { return timestamp; }
    public String getOldCondition() { return oldCondition; }
    public String getNewCondition() { return newCondition; }
    public String getStaffName() { return staffName; }
    public String getComment() { return comment; }

    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
    public void setOldCondition(String oldCondition) { this.oldCondition = oldCondition; }
    public void setNewCondition(String newCondition) { this.newCondition = newCondition; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    public void setComment(String comment) { this.comment = comment; }

    public static ItemHistoryResponseBuilder builder() {
        return new ItemHistoryResponseBuilder();
    }

    public static class ItemHistoryResponseBuilder {
        private ItemHistoryResponse res = new ItemHistoryResponse();

        public ItemHistoryResponseBuilder timestamp(OffsetDateTime timestamp) { res.setTimestamp(timestamp); return this; }
        public ItemHistoryResponseBuilder oldCondition(String oldCondition) { res.setOldCondition(oldCondition); return this; }
        public ItemHistoryResponseBuilder newCondition(String newCondition) { res.setNewCondition(newCondition); return this; }
        public ItemHistoryResponseBuilder staffName(String staffName) { res.setStaffName(staffName); return this; }
        public ItemHistoryResponseBuilder comment(String comment) { res.setComment(comment); return this; }

        public ItemHistoryResponse build() {
            return res;
        }
    }
}
