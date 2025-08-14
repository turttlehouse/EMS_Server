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
    references:{
      model: 'students',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  declare studentId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'tests',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  declare testId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'submissions',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
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
