import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "questions",
  modelName: "Question",
  timestamps: true,
})
class Question extends Model {
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
  declare testId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare questionText: string;

  @Column({
    type:DataType.UUID,
    allowNull:true
  })
  declare correctOptionId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1, // marks per question
  })
  declare marks: number;
}

export default Question;
