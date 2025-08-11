import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "options",
  modelName: "Option",
  timestamps: true,
})
class Option extends Model {
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
  declare questionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare optionLabel: string; // A, B, C, D, etc.

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare optionText: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isCorrect: boolean;
}

export default Option;