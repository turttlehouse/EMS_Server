import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "tests",
  modelName: "Test",
  timestamps: true,
})
class Test extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  // TypeScript declare keyword used to declare the type of a property
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare createdBy: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;
  
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 60,
  })
  declare durationInMinutes: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isPublished: boolean;
}

export default Test;
