import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "student_answers",
  modelName: "StudentAnswer",
  timestamps: true,
})
class StudentAnswer extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare studentId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare testId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare submissionId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare questionId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true, // nullable in case student skips
  })
  declare selectedOptionId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare answeredAt: Date;
}

export default StudentAnswer;
